import React, { useEffect, useState } from 'react';
import { getBookingHistory } from '../api/bookingApi';

const BookingStatus: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getBookingHistory();
        setBookings(res.data.bookings || []);
      } catch (err: any) {
        console.error('[BOOKING_STATUS] Failed to load history', err);
        setError(err.response?.data?.msg || 'Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-white">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Your Bookings</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {bookings.length === 0 ? (
        <div className="text-gray-400">No bookings yet.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-secondary p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-semibold">{b.rideType?.toUpperCase()}</div>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-200 uppercase">
                  {b.status}
                </span>
              </div>
              <div className="text-gray-400 text-sm">
                <div>Pickup: {b.pickup?.address || 'Pickup'}</div>
                <div>Drop: {b.drop?.address || 'Drop'}</div>
                <div className="mt-1">
                  Fare:{' '}
                  <span className="text-accent font-bold">
                    ₹{b.fareBreakdown?.total ?? '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingStatus;


