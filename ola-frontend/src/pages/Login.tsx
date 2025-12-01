import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { login } from '../api/authApi';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[LOGIN] Form submitted with email:', formData.email);
        setError('');
        setLoading(true);

        try {
            console.log('[LOGIN] Calling login API...');
            const response = await login(formData.email, formData.password);
            console.log('[LOGIN] API Response:', response.data);

            if (response.data.ok && response.data.token) {
                console.log('[LOGIN] Login successful! Token received');
                dispatch(setUser({ token: response.data.token, user: response.data.user }));

                // Success notification
                alert(`✅ Welcome back, ${response.data.user.name}!`);
                console.log('[LOGIN] Redirecting to home page...');
                navigate('/');
            } else {
                console.error('[LOGIN] Login failed: No token in response');
                setError('Login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('[LOGIN] Login error:', err);
            console.error('[LOGIN] Error response:', err.response?.data);
            const errorMsg = err.response?.data?.msg || err.message || 'Login failed';
            setError(errorMsg);
            alert(`❌ Login Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
            console.log('[LOGIN] Login process completed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-10">
            <div className="bg-secondary p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-accent hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
