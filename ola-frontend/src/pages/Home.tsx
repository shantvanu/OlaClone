import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, X, Clock, CheckCircle, Loader } from 'lucide-react';
import L from 'leaflet';
import { useDebounce } from 'use-debounce';
import { getBookingHistory } from '../api/bookingApi';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

// Nominatim geocoding function
const searchLocation = async (query: string) => {
  console.log('[HOME] Searching location:', query);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    console.log('[HOME] Search results:', data);
    return data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('[HOME] Geocoding error:', error);
    return [];
  }
};

const Home: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualPickup, setManualPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Track if selections are from dropdown/GPS (not just typed)
  const [pickupSelected, setPickupSelected] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);

  // Destination suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedDestination] = useDebounce(destination, 500);

  // Pickup suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [debouncedPickup] = useDebounce(manualPickup, 500);

  // Order history state
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const navigate = useNavigate();

  // Fetch suggestions when destination changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedDestination.length > 2) {
        console.log('[HOME] Fetching suggestions for:', debouncedDestination);
        const results = await searchLocation(debouncedDestination);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedDestination]);

  // Fetch suggestions when pickup changes
  useEffect(() => {
    const fetchPickupSuggestions = async () => {
      if (debouncedPickup.length > 2) {
        console.log('[HOME] Fetching pickup suggestions for:', debouncedPickup);
        const results = await searchLocation(debouncedPickup);
        setPickupSuggestions(results);
        setShowPickupSuggestions(true);
      } else {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      }
    };

    fetchPickupSuggestions();
  }, [debouncedPickup]);

  const handleFetchLocation = () => {
    console.log('[HOME] Fetch Current Location button clicked');
    setFetchingLocation(true);

    if (navigator.geolocation) {
      console.log('[HOME] Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[HOME] Location fetched successfully:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationFetched(true);
          setPickupSelected(true);
          setFetchingLocation(false);
          setUseManualLocation(false);
          alert('✅ Current location fetched successfully!');
        },
        (error) => {
          console.error('[HOME] Geolocation error:', error);
          console.error('[HOME] Error code:', error.code);
          console.error('[HOME] Error message:', error.message);
          setFetchingLocation(false);

          let errorMsg = 'Failed to fetch location';
          if (error.code === 1) errorMsg = 'Location permission denied';
          else if (error.code === 2) errorMsg = 'Location unavailable';
          else if (error.code === 3) errorMsg = 'Location request timeout';

          alert(`❌ ${errorMsg}\nPlease enter your location manually.`);
          setUseManualLocation(true);
        }
      );
    } else {
      console.error('[HOME] Geolocation not supported');
      alert('❌ Geolocation is not supported by your browser\nPlease enter location manually.');
      setFetchingLocation(false);
      setUseManualLocation(true);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[HOME] Search form submitted');

    // Validate pickup location is selected
    if (!pickupSelected) {
      alert('❌ Please select pickup location from dropdown or fetch GPS');
      return;
    }

    // Validate destination is selected
    if (!destinationSelected) {
      alert('❌ Please select destination from dropdown');
      return;
    }

    let pickupCoords = currentLocation;

    // If using manual location, get it from the selected suggestion
    if (useManualLocation && manualPickup) {
      console.log('[HOME] Using manual pickup:', manualPickup);
      const results = await searchLocation(manualPickup);
      if (results.length > 0) {
        pickupCoords = { lat: results[0].lat, lng: results[0].lng };
        console.log('[HOME] Manual pickup geocoded to:', pickupCoords);
      }
    }

    if (!pickupCoords) {
      alert('❌ Please fetch your current location');
      return;
    }

    console.log('[HOME] Navigating to booking page with:', { pickupCoords, destination });

    navigate('/booking', {
      state: {
        pickup: pickupCoords,
        destinationQuery: destination
      }
    });
  };

  const selectSuggestion = (suggestion: any) => {
    console.log('[HOME] Suggestion selected:', suggestion.name);
    setDestination(suggestion.name);
    setDestinationSelected(true);
    setShowSuggestions(false);
  };

  const selectPickupSuggestion = (suggestion: any) => {
    console.log('[HOME] Pickup suggestion selected:', suggestion.name);
    setManualPickup(suggestion.name);
    setPickupSelected(true);
    setShowPickupSuggestions(false);
  };

  // Initialize with default location
  useEffect(() => {
    console.log('[HOME] Component mounted');
    // Set default to Mumbai
    setCurrentLocation({ lat: 19.0760, lng: 72.8777 });
  }, []);

  // Fetch booking history
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await getBookingHistory();
        if (response.data.ok && response.data.bookings) {
          setBookingHistory(response.data.bookings);
          console.log('[HOME] Booking history fetched:', response.data.bookings);
        }
      } catch (error) {
        console.error('[HOME] Error fetching booking history:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] relative flex">
      {/* Sidebar - Orders */}
      <div className="w-80 bg-secondary/95 backdrop-blur-xl border-r border-gray-700/50 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold text-white mb-4">Your Orders</h2>
          
          {loadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={24} className="text-accent animate-spin" />
            </div>
          ) : bookingHistory && bookingHistory.length > 0 ? (
            <div className="space-y-3">
              {/* Active Orders */}
              {bookingHistory.some((b: any) => b.status === 'ACCEPTED' || b.status === 'PENDING') && (
                <>
                  <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mt-4 mb-2">
                    <Clock size={16} /> Active Rides
                  </h3>
                  {bookingHistory
                    .filter((b: any) => b.status === 'ACCEPTED' || b.status === 'PENDING')
                    .map((booking: any) => (
                      <div
                        key={booking._id}
                        className="bg-primary/50 border border-accent/30 rounded-lg p-3 hover:border-accent/60 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">From</p>
                            <p className="text-sm font-medium text-white truncate">{booking.pickupLocation}</p>
                          </div>
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded whitespace-nowrap ml-2">
                            {booking.status}
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-400">To</p>
                          <p className="text-sm font-medium text-white truncate">{booking.dropLocation}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Distance</p>
                            <p className="text-white font-medium">{booking.distanceKm} km</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Fare</p>
                            <p className="text-white font-medium">₹{booking.fare}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}

              {/* Past Orders */}
              {bookingHistory.some((b: any) => b.status === 'COMPLETED') && (
                <>
                  <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2 mt-4 mb-2">
                    <CheckCircle size={16} /> Completed Rides
                  </h3>
                  {bookingHistory
                    .filter((b: any) => b.status === 'COMPLETED')
                    .slice(0, 5) // Show only last 5
                    .map((booking: any) => (
                      <div
                        key={booking._id}
                        className="bg-primary/50 border border-gray-700/50 rounded-lg p-3 hover:border-gray-600 transition-colors opacity-75"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">From</p>
                            <p className="text-sm font-medium text-white truncate">{booking.pickupLocation}</p>
                          </div>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded whitespace-nowrap ml-2">
                            ✓ Done
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-400">To</p>
                          <p className="text-sm font-medium text-white truncate">{booking.dropLocation}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Distance</p>
                            <p className="text-white font-medium">{booking.distanceKm} km</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Fare</p>
                            <p className="text-white font-medium">₹{booking.fare}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No orders yet</p>
              <p className="text-gray-500 text-xs mt-2">Book your first ride to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Map and Search Panel */}
      <div className="flex-1 relative">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        {currentLocation ? (
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>
                {locationFetched ? 'Your current location' : 'Default location (Mumbai)'}
              </Popup>
            </Marker>
            <RecenterMap lat={currentLocation.lat} lng={currentLocation.lng} />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            Loading Map...
          </div>
        )}
      </div>

      {/* Floating Search Panel */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md z-10">
        <div className="bg-secondary/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 ring-1 ring-white/10">
          <h1 className="text-2xl font-bold mb-4 text-white tracking-tight">Where to?</h1>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Current Location Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Navigation size={20} className="text-accent" />
                <span className="text-sm font-medium text-gray-300">Pickup Location</span>
              </div>

              {!useManualLocation ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={locationFetched ? "Current Location (GPS)" : "Location not fetched"}
                    readOnly
                    className="w-full bg-primary border border-gray-600 rounded-lg px-4 py-3 text-gray-300 focus:outline-none cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    disabled={fetchingLocation}
                    className="w-full bg-accent/20 border border-accent text-accent font-medium py-2 px-4 rounded-lg hover:bg-accent/30 transition-colors disabled:opacity-50 text-sm"
                  >
                    {fetchingLocation ? '📍 Fetching...' : locationFetched ? '✓ Location Fetched' : '📍 Fetch Current Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualLocation(true);
                      console.log('[HOME] Switched to manual location entry');
                    }}
                    className="w-full text-accent text-sm hover:underline"
                  >
                    Or enter manually
                  </button>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={manualPickup}
                      onChange={(e) => setManualPickup(e.target.value)}
                      onFocus={() => pickupSuggestions.length > 0 && setShowPickupSuggestions(true)}
                      placeholder="Enter pickup address"
                      className="w-full bg-primary border border-gray-600 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-accent placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseManualLocation(false);
                        setManualPickup('');
                        console.log('[HOME] Switched back to GPS location');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Pickup Suggestions Dropdown */}
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-primary border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-30">
                      {pickupSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectPickupSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-gray-800 last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-accent mt-1 flex-shrink-0" />
                            <span className="text-white text-sm">{suggestion.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    className="w-full text-accent text-sm hover:underline"
                  >
                    Use GPS instead
                  </button>
                </div>
              )}
            </div>

            {/* Destination Section */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} className="text-red-400" />
                <span className="text-sm font-medium text-gray-300">Destination</span>
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Enter destination"
                className="w-full bg-primary border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent placeholder-gray-500"
                required
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-primary border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-20">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-gray-800 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-accent mt-1 flex-shrink-0" />
                        <span className="text-white text-sm">{suggestion.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!pickupSelected || !destinationSelected}
              className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!pickupSelected ? '📍 Select Pickup Location' : !destinationSelected ? '🎯 Select Destination' : 'Search Ride'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;
