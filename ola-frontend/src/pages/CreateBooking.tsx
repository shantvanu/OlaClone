import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Bike, Zap } from 'lucide-react';
import { getRideOptions, createBooking } from '../api/bookingApi';
import { haversineDistanceKm } from '../utils/helper';

const CreateBooking: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pickup, destinationQuery } = location.state || {};

    // pickup is already { lat, lng }, destinationQuery is the address string
    const pickupCoords = pickup;
    const dropLocation = destinationQuery;

    console.log('[CREATE_BOOKING] Component mounted');
    console.log('[CREATE_BOOKING] Pickup coords:', pickupCoords);
    console.log('[CREATE_BOOKING] Drop location:', dropLocation);

    const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [rideOptions, setRideOptions] = useState<Array<{vehicleType: string; fare: number; estimatedTimeMin: number}>>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('CAR');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if missing location data
    useEffect(() => {
        if (!pickupCoords) {
            console.log('[CREATE_BOOKING] Missing pickup coords, redirecting home');
            navigate('/');
        }
    }, [pickupCoords, navigate]);

    // Geocode destination
    useEffect(() => {
        const geocodeDrop = async () => {
            if (!destinationQuery) return;

            try {
                console.log('[CREATE_BOOKING] Geocoding destination:', destinationQuery);
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery)}&limit=1`
                );
                const data = await response.json();

                if (data.length > 0) {
                    const coords = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                    console.log('[CREATE_BOOKING] Destination geocoded:', coords);
                    setDropCoords(coords);
                } else {
                    console.warn('[CREATE_BOOKING] Destination geocoding failed');
                    setDropCoords(null);
                }
            } catch (err) {
                console.error('[CREATE_BOOKING] Geocoding error:', err);
            }
        };

        geocodeDrop();
    }, [destinationQuery]);

    // Fetch ride options
    useEffect(() => {
        const fetchRideOptions = async () => {
            try {
                if (!pickupCoords || !dropCoords) return;

                const distance = haversineDistanceKm(
                    pickupCoords.lat,
                    pickupCoords.lng,
                    dropCoords.lat,
                    dropCoords.lng
                );

                console.log('[CREATE_BOOKING] Distance calculated:', distance, 'km');

                const response = await getRideOptions(distance);
                console.log('[CREATE_BOOKING] Ride options received:', response.data);

                if (response.data.ok) {
                    setRideOptions(response.data.options);
                }
            } catch (err) {
                console.error('[CREATE_BOOKING] Error fetching ride options:', err);
            }
        };

        fetchRideOptions();
    }, [pickupCoords, dropCoords]);

    const handleBooking = async () => {
        console.log('[CREATE_BOOKING] Book ride clicked, selectedVehicle:', selectedVehicle);

        if (!selectedVehicle || !pickupCoords || !dropCoords) {
            setError('Missing required information');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get selected ride option
            const selected = rideOptions.find((r) => r.vehicleType === selectedVehicle);
            if (!selected) {
                throw new Error('Selected ride type not found');
            }

            const distance = haversineDistanceKm(
                pickupCoords.lat,
                pickupCoords.lng,
                dropCoords.lat,
                dropCoords.lng
            );

            const bookingData = {
                pickupLocation: 'Current Location',
                dropLocation: dropLocation || 'Destination',
                distanceKm: parseFloat(distance.toFixed(2)),
                vehicleType: selectedVehicle,
                fare: selected.fare,
                estimatedTimeMin: selected.estimatedTimeMin
            };

            console.log('[CREATE_BOOKING] Creating booking:', bookingData);

            const response = await createBooking(bookingData);
            console.log('[CREATE_BOOKING] Booking response:', response.data);

            if (response.data.ok) {
                const bookingId = response.data.booking.bookingId;
                alert(
                    `✅ Booking Confirmed!\n\nBooking ID: ${bookingId}\nRide Type: ${selectedVehicle}\nEstimated Fare: ₹${selected.fare}\nEstimated Time: ${selected.estimatedTimeMin} mins\n\nYour ride request has been sent to nearby drivers.`
                );
                console.log('[CREATE_BOOKING] Booking successful, redirecting home');
                navigate('/');
            } else {
                throw new Error('Booking creation failed');
            }
        } catch (err: unknown) {
            console.error('[CREATE_BOOKING] Booking error:', err);
            const errorMsg = ((err as {response?: {data?: {msg?: string}}})?.response?.data?.msg) || (err as Error)?.message || 'Failed to create booking';
            setError(errorMsg);
            alert(`❌ Booking Failed!\n\nReason: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const vehicleIcons: { [key: string]: React.FC<{size: number; className: string}> } = {
        BIKE: Bike,
        AUTO: Zap,
        CAR: Car
    };

    return (
        <div className="min-h-screen bg-primary p-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 text-accent hover:underline text-sm"
                >
                    ← Back
                </button>

                <div className="bg-secondary rounded-lg p-6 mb-6 border border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-4">Select Your Ride</h2>

                    <div className="mb-4 text-gray-300 text-sm">
                        <p>
                            <strong>From:</strong> Current Location
                        </p>
                        <p>
                            <strong>To:</strong> {dropLocation || 'Destination'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {rideOptions.length === 0 ? (
                        <div className="text-gray-400 py-8 text-center">Loading ride options...</div>
                    ) : (
                        <div className="space-y-3">
                            {rideOptions.map((option) => {
                                const Icon = vehicleIcons[option.vehicleType];
                                const isSelected = selectedVehicle === option.vehicleType;

                                return (
                                    <button
                                        key={option.vehicleType}
                                        onClick={() => setSelectedVehicle(option.vehicleType)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-accent/20 border-accent'
                                                : 'bg-primary border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {Icon && (
                                                <Icon
                                                    size={24}
                                                    className={isSelected ? 'text-accent' : 'text-gray-400'}
                                                />
                                            )}
                                            <div className="text-left">
                                                <div
                                                    className={
                                                        isSelected ? 'text-accent font-bold' : 'text-white font-bold'
                                                    }
                                                >
                                                    {option.vehicleType}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    ~{option.estimatedTimeMin} mins
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                isSelected ? 'text-accent text-lg font-bold' : 'text-gray-300'
                                            }
                                        >
                                            ₹{option.fare}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleBooking}
                    disabled={loading || !selectedVehicle || rideOptions.length === 0}
                    className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
            </div>
        </div>
    );
};

export default CreateBooking;

