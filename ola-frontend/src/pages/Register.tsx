import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { register, registerDriver, login, loginDriver } from '../api/authApi';

interface ApiError {
  response?: {
    data?: {
      msg?: string;
    };
  };
  message?: string;
}

const Register: React.FC = () => {
    const [isDriver, setIsDriver] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        vehicleType: 'CAR'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.name || formData.name.length < 2) {
            setError('Name must be at least 2 characters long');
            return false;
        }
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log('[REGISTER] Form submitted. Is Driver:', isDriver);
        console.log('[REGISTER] Form data:', { ...formData, password: '***' });
        setError('');
        setLoading(true);

        try {
            if (isDriver) {
                console.log('[REGISTER] Starting driver registration...');

                // Register driver
                const driverResponse = await registerDriver(
                    formData.name,
                    formData.email,
                    formData.password,
                    formData.vehicleType
                );
                console.log('[REGISTER] Driver registration response:', driverResponse.data);

                if (!driverResponse.data.ok) {
                    throw new Error('Driver registration failed');
                }

                // Login as driver
                const loginResponse = await loginDriver(formData.email, formData.password);
                console.log('[REGISTER] Driver login response:', loginResponse.data);

                const token = loginResponse.data.token;
                localStorage.setItem('token', token);

                dispatch(setUser({
                    token,
                    user: loginResponse.data.user
                }));

                alert(`🚗 Driver Registration Successful!\nWelcome ${formData.name}!`);
                console.log('[REGISTER] Navigating to driver dashboard...');
                navigate('/driver');
            } else {
                console.log('[REGISTER] Starting user registration...');

                // Register user
                const registerResponse = await register(formData.name, formData.email, formData.password);
                console.log('[REGISTER] User registration response:', registerResponse.data);

                if (!registerResponse.data.ok) {
                    throw new Error('User registration failed');
                }

                // Auto-login
                const loginResponse = await login(formData.email, formData.password);
                console.log('[REGISTER] User login response:', loginResponse.data);

                dispatch(setUser({ token: loginResponse.data.token, user: loginResponse.data.user }));

                alert(`✅ Registration Successful!\nWelcome ${formData.name}!`);
                console.log('[REGISTER] Navigating to home page...');
                navigate('/');
            }
        } catch (err: unknown) {
            console.error('[REGISTER] Registration error:', err);
            const apiErr = err as ApiError;
            console.error('[REGISTER] Error response:', apiErr.response?.data);
            const errorMsg = apiErr.response?.data?.msg || apiErr.message || 'Registration failed';
            setError(errorMsg);
            alert(`❌ Registration Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
            console.log('[REGISTER] Registration process completed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-10">
            <div className="bg-secondary p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>

                <div className="flex bg-primary p-1 rounded-lg mb-6 border border-gray-700">
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isDriver ? 'bg-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => {
                            setIsDriver(false);
                            setError('');
                            console.log('[REGISTER] Switched to Passenger mode');
                        }}
                    >
                        Passenger
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isDriver ? 'bg-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => {
                            setIsDriver(true);
                            setError('');
                            console.log('[REGISTER] Switched to Driver mode');
                        }}
                    >
                        Driver
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-primary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-primary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-primary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {isDriver && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Type</label>
                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="w-full bg-primary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                                required
                            >
                                <option value="BIKE">Bike</option>
                                <option value="AUTO">Auto</option>
                                <option value="CAR">Car</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
