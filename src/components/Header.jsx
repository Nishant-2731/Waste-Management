import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header({ points, user }) {
  const { signOut } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 border-b-2 border-gray-200">
      <div>
        <h1 className="text-xl font-bold text-blue-800">Samsung Eco Rewards</h1>
        <p className="text-sm text-gray-500">
          {user ? `Welcome, ${user.name}!` : 'Recycle your e-waste responsibly.'}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-center">
          <div className="flex items-center justify-center bg-green-100 text-green-800 p-2 rounded-lg">
            <i className="fa-solid fa-leaf mr-2"></i>
            <span className="font-bold text-lg">{points}</span>
          </div>
          <p className="text-xs text-gray-500">Eco-Points</p>
        </div>
        {user && (
          <button
            onClick={signOut}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
            title="Sign Out"
          >
            <i className="fa-solid fa-sign-out-alt"></i>
          </button>
        )}
      </div>
    </header>
  );
}