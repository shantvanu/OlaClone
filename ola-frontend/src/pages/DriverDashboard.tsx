import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getNearbyRequests, acceptAssignment, startRide, completeRide, updateLocation, getDriverCurrentBooking } from '../api/driverApi';
import { MapPin, Navigation, User } from 'lucide-react';

const DriverDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const driverId = user?.driverId;
    const vehicleType = user?.vehicleType || 'car';

    console.log('[DRIVER_DASHBOARD] Component mounted');
    console.log('[DRIVER_DASHBOARD] Driver ID:', driverId);
    console.log('[DRIVER_DASHBOARD] Vehicle Type:', vehicleType);
    console.log('[DRIVER_DASHBOARD] User data:', user);

    const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests');
    const [requests, setRequests] = useState<any[]>([]);
    const [currentRide, setCurrentRide] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState('');

    // Poll for nearby requests or current booking
    useEffect(() => {
        let interval: any;

        const fetchData = async () => {
            if (!isOnline || !driverId) {
                console.log('[DRIVER_DASHBOARD] Skipping fetch - Online:', isOnline, 'Driver ID:', driverId);
                return;
            }

            try {
                console.log('[DRIVER_DASHBOARD] Fetching driver data...');

                // First check if we have an active booking
                const bookingRes = await getDriverCurrentBooking(driverId);
                console.log('[DRIVER_DASHBOARD] Current booking response:', bookingRes.data);

                if (bookingRes.data.booking) {
                    console.log('[DRIVER_DASHBOARD] Active booking found:', bookingRes.data.booking);
                    setCurrentRide(bookingRes.data.booking);
                    setActiveTab('active');
                } else {
                    console.log('[DRIVER_DASHBOARD] No active booking, checking nearby requests...');

                    // If no active booking, check for nearby requests
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async (position) => {
                            try {
                                const lat = position.coords.latitude;
                                const lng = position.coords.longitude;
                                console.log(`[DRIVER_DASHBOARD] Current position: ${lat}, ${lng}`);

                                const nearbyRes = await getNearbyRequests(lat, lng, vehicleType);
                                console.log('[DRIVER_DASHBOARD] Nearby requests response:', nearbyRes.data);

                                const requestsList = nearbyRes.data.drivers || [];
                                console.log(`[DRIVER_DASHBOARD] Found ${requestsList.length} nearby requests`);
                                setRequests(requestsList);
                            } catch (err) {
                                console.error("[DRIVER_DASHBOARD] Error fetching nearby requests:", err);
                            }
                        }, (err) => {
                            console.error('[DRIVER_DASHBOARD] Geolocation error during polling:', err);
                        });
                    }
                }
            } catch (error: any) {
                console.error("[DRIVER_DASHBOARD] Error fetching driver data:", error);
                console.error("[DRIVER_DASHBOARD] Error response:", error.response?.data);
            }
        };

        if (isOnline) {
            console.log('[DRIVER_DASHBOARD] Starting polling (every 5s)...');
            fetchData(); // Initial fetch
            interval = setInterval(fetchData, 5000); // Poll every 5s
        }

        return () => {
            if (interval) {
                console.log('[DRIVER_DASHBOARD] Stopping polling');
                clearInterval(interval);
            }
        };
    }, [isOnline, driverId, vehicleType]);

    const toggleOnline = async () => {
        console.log('[DRIVER_DASHBOARD] Toggle online clicked. Current state:', isOnline);

        if (!driverId) {
            const errorMsg = "Driver ID not found. Please register as a driver.";
            console.error('[DRIVER_DASHBOARD]', errorMsg);
            setError(errorMsg);
            alert(`❌ ${errorMsg}`);
            return;
        }

        if (!isOnline) {
            console.log('[DRIVER_DASHBOARD] Going online...');

            // Going online: Update location first
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const coords = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        console.log('[DRIVER_DASHBOARD] Updating location:', coords);

                        await updateLocation(driverId, coords);
                        console.log('[DRIVER_DASHBOARD] Location updated successfully');

                        setIsOnline(true);
                        setError('');
                        alert(`✅ You are now Online!\n\nLocation: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}\n\nWaiting for ride requests...`);
                    } catch (err: any) {
                        console.error('[DRIVER_DASHBOARD] Failed to update location:', err);
                        console.error('[DRIVER_DASHBOARD] Error response:', err.response?.data);
                        const errorMsg = "Failed to update location. Cannot go online.";
                        setError(errorMsg);
                        alert(`❌ ${errorMsg}`);
                    }
                }, (err) => {
                    console.error('[DRIVER_DASHBOARD] Geolocation error:', err);
                    const errorMsg = "Location permission denied. Cannot go online.";
                    setError(errorMsg);
                    alert(`❌ ${errorMsg}\n\nPlease enable location permissions in your browser.`);
                });
            } else {
                console.error('[DRIVER_DASHBOARD] Geolocation not supported');
                const errorMsg = "Geolocation not supported.";
                setError(errorMsg);
                alert(`❌ ${errorMsg}`);
            }
        } else {
            console.log('[DRIVER_DASHBOARD] Going offline...');
            setIsOnline(false);
            setRequests([]);
            alert(`📍 You are now Offline\n\nYou will not receive new ride requests.`);
        }
    };

    const handleAccept = async (bookingId: string) => {
        if (!driverId) {
            console.error('[DRIVER_DASHBOARD] Cannot accept - no driver ID');
            return;
        }

        console.log('[DRIVER_DASHBOARD] Accepting booking:', bookingId);
        setLoading(true);

        try {
            await acceptAssignment(driverId, bookingId);
            console.log('[DRIVER_DASHBOARD] Booking accepted successfully');

            // Refresh to switch to active tab
            const bookingRes = await getDriverCurrentBooking(driverId);
            console.log('[DRIVER_DASHBOARD] Fetched accepted booking:', bookingRes.data.booking);

            setCurrentRide(bookingRes.data.booking);
            setActiveTab('active');
            alert(`✅ Ride Accepted!\n\nBooking ID: ${bookingId}\n\nNavigate to pickup location and start the ride.`);
        } catch (error: any) {
            console.error('[DRIVER_DASHBOARD] Failed to accept ride:', error);
            console.error('[DRIVER_DASHBOARD] Error response:', error.response?.data);
            alert(`❌ Failed to accept ride\n\n${error.response?.data?.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStartRide = async () => {
        if (!currentRide || !driverId) {
            console.error('[DRIVER_DASHBOARD] Cannot start ride - missing data');
            return;
        }

        console.log('[DRIVER_DASHBOARD] Starting ride:', currentRide._id);
        setLoading(true);

        try {
            await startRide(driverId, currentRide._id);
            console.log('[DRIVER_DASHBOARD] Ride started successfully');

            setCurrentRide({ ...currentRide, status: 'running' });
            alert(`🚗 Ride Started!\n\nBooking ID: ${currentRide._id}\n\nDrive safely to the destination.`);
        } catch (error: any) {
            console.error('[DRIVER_DASHBOARD] Failed to start ride:', error);
            console.error('[DRIVER_DASHBOARD] Error response:', error.response?.data);
            alert(`❌ Failed to start ride\n\n${error.response?.data?.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRide = async () => {
        if (!currentRide || !driverId) {
            console.error('[DRIVER_DASHBOARD] Cannot complete ride - missing data');
            return;
        }

        console.log('[DRIVER_DASHBOARD] Completing ride:', currentRide._id);
        setLoading(true);

        try {
            await completeRide(driverId, currentRide._id);
            console.log('[DRIVER_DASHBOARD] Ride completed successfully');

            const fareAmount = currentRide.fareBreakdown?.total || 'N/A';
            alert(`✅ Ride Completed!\n\nBooking ID: ${currentRide._id}\nFare: ₹${fareAmount}\n\nThank you for the ride!`);

            setCurrentRide(null);
            setActiveTab('requests');
        } catch (error: any) {
            console.error('[DRIVER_DASHBOARD] Failed to complete ride:', error);
            console.error('[DRIVER_DASHBOARD] Error response:', error.response?.data);
            alert(`❌ Failed to complete ride\n\n${error.response?.data?.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!driverId) {
        console.warn('[DRIVER_DASHBOARD] No driver ID found in user state');
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Driver Dashboard</h1>
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    <strong>Access Denied</strong>
                    <p className="mt-2">You must register as a driver to access this page.</p>
                    <p className="text-sm mt-2">Please go to Register and select "Driver".</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Driver Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Driver ID: {driverId}</p>
                </div>
                <button
                    onClick={toggleOnline}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${isOnline ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    {isOnline ? '🟢 You are Online' : '⚪ Go Online'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {!isOnline ? (
                <div className="text-center py-20 text-gray-500">
                    <h2 className="text-xl">Go online to start receiving ride requests</h2>
                    <p className="text-sm mt-2">Click the "Go Online" button above</p>
                </div>
            ) : (
                <div>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('requests');
                                console.log('[DRIVER_DASHBOARD] Switched to Requests tab');
                            }}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'requests' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
                                }`}
                        >
                            Requests ({requests.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('active');
                                console.log('[DRIVER_DASHBOARD] Switched to Active Ride tab');
                            }}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'active' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'
                                }`}
                        >
                            Active Ride
                        </button>
                    </div>

                    {activeTab === 'requests' && (
                        <div className="grid gap-4">
                            {requests.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No nearby requests...</p>
                                    <p className="text-sm mt-2">Waiting for passengers to book rides</p>
                                </div>
                            ) : (
                                requests.map((req) => (
                                    <div key={req._id} className="bg-secondary p-6 rounded-xl border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
                                                <User size={20} className="text-accent" />
                                                <span>Passenger</span>
                                            </div>
                                            <div className="space-y-1 text-gray-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-green-400" />
                                                    <span>Pickup: {req.pickup?.address || 'Location'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-red-400" />
                                                    <span>Drop: {req.drop?.address || 'Destination'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-white">
                                                    <span className="bg-gray-800 px-2 py-1 rounded text-xs uppercase">{req.rideType}</span>
                                                    <span className="font-bold">₹{req.fareBreakdown?.total || '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAccept(req._id)}
                                            disabled={loading}
                                            className="bg-accent text-black px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="bg-secondary p-8 rounded-xl border border-gray-700">
                            {currentRide ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Current Ride</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentRide.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {currentRide.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-accent">₹{currentRide.fareBreakdown?.total}</div>
                                            <div className="text-gray-400 text-sm">{currentRide.rideType}</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 bg-primary/50 p-6 rounded-lg">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="mt-1"><Navigation size={20} className="text-green-400" /></div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold">Pickup</div>
                                                    <div className="text-white">{currentRide.pickup?.address || 'Pickup location'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="mt-1"><MapPin size={20} className="text-red-400" /></div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold">Drop</div>
                                                    <div className="text-white">{currentRide.drop?.address || 'Drop location'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center items-center gap-4">
                                            {currentRide.status === 'assigned' || currentRide.status === 'accepted' ? (
                                                <button
                                                    onClick={handleStartRide}
                                                    disabled={loading}
                                                    className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                                >
                                                    {loading ? 'Starting...' : 'Start Ride'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleCompleteRide}
                                                    disabled={loading}
                                                    className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                                >
                                                    {loading ? 'Completing...' : 'Complete Ride'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>No active ride</p>
                                    <p className="text-sm mt-2">Check requests tab to accept a ride</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
