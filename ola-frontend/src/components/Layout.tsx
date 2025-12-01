import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { logout } from '../redux/userSlice';
import { Car, LogOut, User as UserIcon } from 'lucide-react';

const Layout: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-primary text-text-main">
            <nav className="bg-secondary border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent tracking-tighter">
                    <Car size={28} />
                    <span>OlaClone</span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/booking" className="hover:text-accent transition-colors">Book a Ride</Link>
                            {user.role === 'driver' && (
                                <Link to="/driver" className="hover:text-accent transition-colors">Driver Dashboard</Link>
                            )}
                            <div className="flex items-center gap-4 ml-4">
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <UserIcon size={16} />
                                    <span>{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-gray-800 rounded-full transition-colors text-red-400"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <main className="flex-1 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
