import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Bike, User } from 'lucide-react';
import { createBooking } from '../api/bookingApi';

// Mock geocoding - replace with actual service
const getCoordsFromAddress = async (address: string) => {
    console.log('[CREATE_BOOKING] Geocoding address:', address);
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            console.log('[CREATE_BOOKING] Geocoded successfully:', coords);
            return coords;
        }
    } catch (error) {
        console.error('[CREATE_BOOKING] Geocoding error:', error);
    }
    // Fallback to Mumbai suburbs if geocoding fails
    const fallback = { lat: 19.0760 + Math.random() * 0.1, lng: 72.8777 + Math.random() * 0.1 };
    console.warn('[CREATE_BOOKING] Using fallback coordinates:', fallback);
    return fallback;
};

const CreateBooking: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pickup, destinationQuery } = location.state || {};

    console.log('[CREATE_BOOKING] Component mounted');
    console.log('[CREATE_BOOKING] Pickup:', pickup);
    console.log('[CREATE_BOOKING] Destination query:', destinationQuery);

    const [pickupCoords] = useState(pickup || { lat: 19.0760, lng: 72.8777 });
    const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedRide, setSelectedRide] = useState<string>('car');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const rideOptions = [
        { type: 'car', label: 'Car', icon: Car, price: 250, time: '15 mins', description: 'Comfortable sedan' },
        { type: 'auto', label: 'Auto', icon: User, price: 150, time: '12 mins', description: 'Quick & affordable' },
        { type: 'bike', label: 'Bike', icon: Bike, price: 80, time: '8 mins', description: 'Fastest option' },
    ];

    useEffect(() => {
        const fetchDropCoords = async () => {
            if (destinationQuery) {
                console.log('[CREATE_BOOKING] Fetching drop coordinates...');
                const coords = await getCoordsFromAddress(destinationQuery);
                setDropCoords(coords);
            }
        };
        fetchDropCoords();
    }, [destinationQuery]);

    const handleBooking = async () => {
        console.log('[CREATE_BOOKING] Book Ride button clicked');
        console.log('[CREATE_BOOKING] Selected ride type:', selectedRide);

        // Validation
        if (!pickup || !pickup.lat || !pickup.lng) {
            const errorMsg = 'Pickup location is missing or invalid';
            console.error('[CREATE_BOOKING] Validation error:', errorMsg);
            alert(`❌ ${errorMsg}`);
            setError(errorMsg);
            return;
        }

        if (!dropCoords || !dropCoords.lat || !dropCoords.lng) {
            const errorMsg = 'Drop location is missing or invalid';
            console.error('[CREATE_BOOKING] Validation error:', errorMsg);
            alert(`❌ ${errorMsg}`);
            setError(errorMsg);
            return;
        }

        if (!selectedRide) {
            const errorMsg = 'Please select a ride type';
            console.error('[CREATE_BOOKING] Validation error:', errorMsg);
            alert(`❌ ${errorMsg}`);
            setError(errorMsg);
            return;
        }

        setLoading(true);
        setError('');

        const bookingData = {
            pickup: {
                address: 'Pickup Location',
                coords: pickup
            },
            drop: {
                address: destinationQuery || 'Drop Location',
                coords: dropCoords
            },
            rideType: selectedRide,
            paymentMethod: 'cash'
        };

        console.log('[CREATE_BOOKING] Creating booking with data:', bookingData);

        try {
            const response = await createBooking(bookingData);
            console.log('[CREATE_BOOKING] Booking response:', response.data);

            if (response.data.ok) {
                const booking = response.data.booking;
                const bookingId = booking._id;
                const amount = booking.fareBreakdown?.total || rideOptions.find(r => r.type === selectedRide)?.price || 0;
                console.log('[CREATE_BOOKING] Booking created successfully! ID:', bookingId, 'Amount:', amount);

                alert(`✅ Booking Confirmed!

Booking ID: ${bookingId}
Ride Type: ${selectedRide.toUpperCase()}
Estimated Fare: ₹${amount}

Your ride request has been sent to nearby drivers.
You will be notified when a driver accepts your request.`);

                // Navigate back to home
                navigate('/');
            } else {
                throw new Error('Booking creation failed - no success flag');
            }
        } catch (err: any) {
            console.error('[CREATE_BOOKING] Booking error:', err);
            console.error('[CREATE_BOOKING] Error response:', err.response?.data);

            const errorMessage = err.response?.data?.msg || err.message || 'Failed to create booking';
            console.error('[CREATE_BOOKING] Error message:', errorMessage);

            setError(errorMessage);
            alert(`❌ Booking Failed!

Reason: ${errorMessage}

Please try again or contact support.`);
        } finally {
            setLoading(false);
            console.log('[CREATE_BOOKING] Booking process completed');
        }
    };

    if (!dropCoords) {
        console.log('[CREATE_BOOKING] Waiting for drop coordinates...');
        return (
            <div className="flex items-center justify-center h-screen bg-primary">
                <div className="text-white text-xl">Loading route...</div>
            </div>
        );
    }

    const routePath = [
        [pickupCoords.lat, pickupCoords.lng],
        [dropCoords.lat, dropCoords.lng]
    ];

    console.log('[CREATE_BOOKING] Rendering map with route:', routePath);

    return (
        <div className="h-[calc(100vh-64px)] flex">
            {/* Map Section */}
            <div className="w-1/2 relative">
                <MapContainer
                    center={[pickupCoords.lat, pickupCoords.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[pickupCoords.lat, pickupCoords.lng]} />
                    <Marker position={[dropCoords.lat, dropCoords.lng]} />
                    <Polyline positions={routePath as any} color="#C6F135" weight={4} />
                </MapContainer>
            </div>

            {/* Ride Selection Section */}
            <div className="w-1/2 bg-primary p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Ride</h2>
                <p className="text-gray-400 mb-6">Select the best option for your journey</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    {rideOptions.map((ride) => (
                        <button
                            key={ride.type}
                            onClick={() => {
                                setSelectedRide(ride.type);
                                console.log('[CREATE_BOOKING] Ride type selected:', ride.type);
                            }}
                            className={`w-full p-6 rounded-xl border-2 transition-all ${selectedRide === ride.type
                                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                                : 'border-gray-700 bg-secondary hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${selectedRide === ride.type ? 'bg-accent' : 'bg-gray-700'}`}>
                                        <ride.icon size={24} className={selectedRide === ride.type ? 'text-black' : 'text-white'} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-lg">{ride.label}</div>
                                        <div className="text-gray-400 text-sm">{ride.description}</div>
                                        <div className="text-gray-500 text-xs mt-1">{ride.time} away</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-accent font-bold text-2xl">₹{ride.price}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-secondary p-6 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Selected Ride</span>
                        <span className="text-white font-bold">{rideOptions.find(r => r.type === selectedRide)?.label}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Estimated Fare</span>
                        <span className="text-accent font-bold text-xl">₹{rideOptions.find(r => r.type === selectedRide)?.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Estimated Time</span>
                        <span className="text-white">{rideOptions.find(r => r.type === selectedRide)?.time}</span>
                    </div>
                </div>

                <button
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full bg-accent text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg shadow-lg"
                >
                    {loading ? 'Creating Booking...' : 'Confirm & Book Ride'}
                </button>

                <p className="text-gray-500 text-xs text-center mt-4">
                    By booking, you agree to our terms and conditions
                </p>
            </div>
        </div>
    );
};

export default CreateBooking;
