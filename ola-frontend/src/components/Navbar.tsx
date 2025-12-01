import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/userSlice';
import type { RootState } from '../redux/store';
import { LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  if (!token || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-secondary border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-accent">OlaClone</h1>
          {user && (
            <div className="text-gray-400 text-sm">
              <span className="text-white">{user.name}</span>
              {user.role === 'driver' && <span> • {user.vehicleType}</span>}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
