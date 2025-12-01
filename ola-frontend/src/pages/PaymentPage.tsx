import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId, amount } = location.state || { bookingId: null, amount: 250 };

    console.log('[PAYMENT] Component mounted');
    console.log('[PAYMENT] Booking ID:', bookingId);
    console.log('[PAYMENT] Amount:', amount);

    const [selectedMethod, setSelectedMethod] = useState<string>('cash');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const paymentMethods = [
        {
            id: 'cash',
            label: 'Cash',
            icon: DollarSign,
            description: 'Pay with cash after ride',
            color: 'text-green-400'
        },
        {
            id: 'upi',
            label: 'UPI',
            icon: Smartphone,
            description: 'Pay via UPI (Google Pay, PhonePe, Paytm)',
            color: 'text-blue-400'
        },
        {
            id: 'card',
            label: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, RuPay',
            color: 'text-purple-400'
        },
        {
            id: 'wallet',
            label: 'Wallet',
            icon: Wallet,
            description: 'Paytm, PhonePe, Amazon Pay',
            color: 'text-orange-400'
        },
    ];

    const validateUPI = (upi: string): boolean => {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        return upiRegex.test(upi);
    };

    const validateCard = (): boolean => {
        // Basic validation
        const cardRegex = /^\d{16}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3,4}$/;

        if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
            setError('Invalid card number (must be 16 digits)');
            return false;
        }
        if (!expiryRegex.test(cardExpiry)) {
            setError('Invalid expiry date (MM/YY format)');
            return false;
        }
        if (!cvvRegex.test(cardCVV)) {
            setError('Invalid CVV (must be 3-4 digits)');
            return false;
        }
        return true;
    };

    const handlePayment = async () => {
        console.log('[PAYMENT] Process payment clicked');
        console.log('[PAYMENT] Selected method:', selectedMethod);

        setError('');
        setLoading(true);

        try {
            // Validation based on payment method
            if (selectedMethod === 'upi') {
                if (!upiId) {
                    throw new Error('Please enter your UPI ID');
                }
                if (!validateUPI(upiId)) {
                    throw new Error('Invalid UPI ID format (e.g., user@paytm)');
                }
                console.log('[PAYMENT] UPI ID validated:', upiId);
            } else if (selectedMethod === 'card') {
                if (!cardNumber || !cardExpiry || !cardCVV) {
                    throw new Error('Please fill all card details');
                }
                if (!validateCard()) {
                    console.error('[PAYMENT] Card validation failed');
                    setLoading(false);
                    return;
                }
                console.log('[PAYMENT] Card details validated');
            }

            console.log('[PAYMENT] Processing payment...');

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('[PAYMENT] Payment processed successfully');

            if (selectedMethod === 'cash') {
                alert(`✅ Payment Method Selected: Cash\n\nYou will pay ₹${amount} in cash to the driver after the ride.`);
            } else {
                alert(`✅ Payment Successful!\n\nAmount: ₹${amount}\nMethod: ${selectedMethod.toUpperCase()}\nBooking ID: ${bookingId || 'N/A'}\n\nThank you for your payment!`);
            }

            console.log('[PAYMENT] Redirecting to home...');
            navigate('/');

        } catch (err: any) {
            console.error('[PAYMENT] Payment error:', err);
            const errorMsg = err.message || 'Payment failed. Please tryagain.';
            setError(errorMsg);
            alert(`❌ Payment Failed!\n\n${errorMsg}`);
        } finally {
            setLoading(false);
            console.log('[PAYMENT] Payment process completed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-primary py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-secondary p-8 rounded-2xl shadow-xl border border-gray-800">
                    <h2 className="text-3xl font-bold text-white mb-2">Payment</h2>
                    <p className="text-gray-400 mb-6">Choose your payment method</p>

                    {/* Amount Display */}
                    <div className="bg-accent/10 border-2 border-accent rounded-xl p-6 mb-8">
                        <div className="text-center">
                            <div className="text-gray-400 text-sm mb-1">Total Amount</div>
                            <div className="text-accent font-bold text-4xl">₹{amount}</div>
                            {bookingId && (
                                <div className="text-gray-500 text-xs mt-2">Booking ID: {bookingId}</div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {/* Payment Methods */}
                    <div className="space-y-3 mb-6">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setSelectedMethod(method.id);
                                    setError('');
                                    console.log('[PAYMENT] Payment method selected:', method.id);
                                }}
                                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${selectedMethod === method.id
                                        ? 'border-accent bg-accent/10'
                                        : 'border-gray-700 bg-primary hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${selectedMethod === method.id ? 'bg-accent/20' : 'bg-gray-700'}`}>
                                        <method.icon size={24} className={method.color} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">{method.label}</div>
                                        <div className="text-gray-400 text-sm">{method.description}</div>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-black"></div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Payment Details Forms */}
                    {selectedMethod === 'upi' && (
                        <div className="bg-primary p-6 rounded-xl mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Enter UPI ID</label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="yourname@paytm"
                                className="w-full bg-secondary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                            />
                            <p className="text-gray-500 text-xs mt-2">Example: user@paytm, user@phonepe, user@googlepay</p>
                        </div>
                    )}

                    {selectedMethod === 'card' && (
                        <div className="bg-primary p-6 rounded-xl mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Card Number</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                                        setCardNumber(value.slice(0, 16));
                                    }}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full bg-secondary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                    maxLength={16}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Expiry (MM/YY)</label>
                                    <input
                                        type="text"
                                        value={cardExpiry}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length >= 2) {
                                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                            }
                                            setCardExpiry(value);
                                        }}
                                        placeholder="12/25"
                                        className="w-full bg-secondary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">CVV</label>
                                    <input
                                        type="password"
                                        value={cardCVV}
                                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="123"
                                        className="w-full bg-secondary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMethod === 'wallet' && (
                        <div className="bg-primary p-6 rounded-xl mb-6 text-center">
                            <p className="text-gray-400">You will be redirected to your wallet app to complete the payment</p>
                        </div>
                    )}

                    {selectedMethod === 'cash' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl mb-6">
                            <p className="text-yellow-200 text-sm">
                                ℹ️ You have selected Cash payment. Please pay ₹{amount} to the driver after completing your ride.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                console.log('[PAYMENT] Back button clicked');
                                navigate(-1);
                            }}
                            className="flex-1 bg-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="flex-1 bg-accent text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : selectedMethod === 'cash' ? 'Confirm Cash Payment' : 'Pay Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
