import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ points }) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="flex justify-between items-center p-4 border-b-2 border-gray-200">
      <div>
        <h1 className="text-xl font-bold text-blue-800">Samsung Eco Rewards</h1>
        <p className="text-sm text-gray-500">Recycle your e-waste responsibly.</p>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Points Display */}
        <div className="text-center">
          <div className="flex items-center justify-center bg-green-100 text-green-800 p-2 rounded-lg">
            <i className="fa-solid fa-leaf mr-2"></i>
            <span className="font-bold text-lg">{points}</span>
          </div>
          <p className="text-xs text-gray-500">Eco-Points</p>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}