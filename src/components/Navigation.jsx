import React from 'react';

export default function Navigation({ activeView, setActiveView }) {
  const navItems = [
    { id: 'home', icon: 'fa-house', label: 'Home' },
    { id: 'map', icon: 'fa-map-location-dot', label: 'Centers' },
    { id: 'rewards', icon: 'fa-gift', label: 'Rewards' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 max-w-lg mx-auto">
      <div className="flex justify-around">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex-1 p-4 text-center text-gray-600 border-b-4 transition-colors duration-300 ${
              activeView === item.id ? 'text-blue-700 border-blue-700' : 'border-transparent'
            }`}
          >
            <i className={`fa-solid ${item.icon} block mx-auto text-xl mb-1`}></i>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}