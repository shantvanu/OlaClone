import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { getPendingRides, acceptRide, getDriverEarnings } from '../api/driverApi';
import { MapPin } from 'lucide-react';

interface Ride {
  _id: string;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  vehicleType: string;
  fare: number;
  estimatedTimeMin: number;
  status: string;
}

interface RideError {
  response?: {
    data?: {
      msg?: string;
    };
  };
}

const DriverDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();

    const [pendingRides, setPendingRides] = useState<Ride[]>([]);
    const [earnings, setEarnings] = useState(0);
    const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);

    // Check if user is driver
    useEffect(() => {
        if (!user || user.role !== 'driver') {
            console.log('[DRIVER_DASHBOARD] User is not a driver, redirecting to login');
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch pending rides
    const fetchRides = async () => {
        try {
            if (!user || !user.vehicleType) return;

            console.log('[DRIVER_DASHBOARD] Fetching rides for vehicle type:', user.vehicleType);
            const response = await getPendingRides(user.vehicleType);
            console.log('[DRIVER_DASHBOARD] Rides response:', response.data);

            if (response.data.ok) {
                setPendingRides(response.data.rides || []);
            }
        } catch (err) {
            console.error('[DRIVER_DASHBOARD] Error fetching rides:', err);
        }
    };

    // Fetch driver earnings
    const fetchEarnings = async () => {
        try {
            const response = await getDriverEarnings();
            console.log('[DRIVER_DASHBOARD] Earnings response:', response.data);

            if (response.data.ok) {
                setEarnings(response.data.earnings || 0);
            }
        } catch (err) {
            console.error('[DRIVER_DASHBOARD] Error fetching earnings:', err);
        }
    };

    // Toggle online status
    const toggleOnline = () => {
        if (!isOnline) {
            console.log('[DRIVER_DASHBOARD] Going online');
            setIsOnline(true);
            fetchRides();
            fetchEarnings();

            // Set up polling
            const interval = setInterval(() => {
                console.log('[DRIVER_DASHBOARD] Polling for new rides');
                fetchRides();
            }, 5000);

            setRefreshInterval(interval);
        } else {
            console.log('[DRIVER_DASHBOARD] Going offline');
            setIsOnline(false);
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    // Handle accept ride
    const handleAcceptRide = async (bookingId: string) => {
        console.log('[DRIVER_DASHBOARD] Accepting ride:', bookingId);
        setAcceptingBookingId(bookingId);

        try {
            const response = await acceptRide(bookingId);
            console.log('[DRIVER_DASHBOARD] Accept response:', response.data);

            if (response.data.ok) {
                // Immediately update earnings with the earned amount
                const earnedAmount = response.data.earnedAmount;
                const newEarnings = earnings + earnedAmount;
                setEarnings(newEarnings);
                
                alert(`✅ ${response.data.message}\n\nYou earned ₹${earnedAmount}`);

                // Refresh rides to remove accepted ride from list
                await fetchRides();
            }
        } catch (err: unknown) {
            console.error('[DRIVER_DASHBOARD] Error accepting ride:', err);
            const rideErr = err as RideError;
            const errorMsg = rideErr.response?.data?.msg || 'Failed to accept ride';
            alert(`❌ Error: ${errorMsg}`);
        } finally {
            setAcceptingBookingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-primary p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-secondary rounded-lg p-6 mb-6 border border-gray-800">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-white">Driver Dashboard</h1>
                        <p className="text-gray-400 mt-1">
                            {user?.name} • {user?.vehicleType}
                        </p>
                    </div>

                    {/* Online/Offline Toggle */}
                    <button
                        onClick={toggleOnline}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${
                            isOnline
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {isOnline ? '🟢 You are Online' : '⚫ Go Online'}
                    </button>

                    {/* Earnings */}
                    <div className="mt-4 text-center bg-primary p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Today's Earnings</p>
                        <p className="text-2xl font-bold text-accent">₹{earnings}</p>
                    </div>
                </div>

                {/* Pending Rides */}
                {isOnline && (
                    <div className="bg-secondary rounded-lg p-6 border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4">Available Rides</h2>

                        {pendingRides.length === 0 ? (
                            <div className="text-gray-400 py-8 text-center">
                                No ride requests at the moment. Waiting for passengers...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingRides.map((ride) => (
                                    <div
                                        key={ride._id}
                                        className="bg-primary p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="text-gray-400 text-sm">Pickup</p>
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    {ride.pickupLocation}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-accent font-bold text-lg">₹{ride.fare}</p>
                                                <p className="text-gray-400 text-xs">
                                                    ~{ride.estimatedTimeMin} min
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-400 text-sm">Drop</p>
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <MapPin size={16} />
                                                {ride.dropLocation}
                                            </p>
                                        </div>

                                        <div className="text-gray-400 text-xs mb-4">
                                            Distance: {ride.distanceKm} km
                                        </div>

                                        <button
                                            onClick={() => handleAcceptRide(ride._id)}
                                            disabled={acceptingBookingId === ride._id}
                                            className="w-full bg-accent text-black font-bold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {acceptingBookingId === ride._id ? 'Accepting...' : 'Accept Ride'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
