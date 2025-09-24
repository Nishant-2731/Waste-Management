import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { db } from './lib/firebase.js';

import Header from './components/Header.jsx';
import Loader from './components/Loader.jsx';
import HomeSection from './components/HomeSection.jsx';
import MapSection from './components/MapSection.jsx';
import RewardsSection from './components/RewardsSection.jsx';
import Navigation from './components/Navigation.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';

function AppContent() {
  const [view, setView] = useState('home'); // 'home' | 'map' | 'rewards' | 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, isAuthenticated, updatePoints } = useAuth();

  const handleSerialSubmit = async serial => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await db.awardPoints(100, 'device-serial', serial);
      updatePoints(result.points);
      window.alert('Success! 100 Eco-Points have been added to your account.');
      setView('map');
    } catch (error) {
      console.error('Error awarding points:', error);
      window.alert('There was an issue awarding points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (cost, name) => {
    if (!user) return;
    if (user.points < cost) {
      window.alert("You don't have enough points for this item.");
      return;
    }
    if (window.confirm(`Are you sure you want to redeem "${name}" for ${cost} points?`)) {
      try {
        // TODO: Implement API call to redeem points
        window.alert('Redemption successful!');
      } catch (error) {
        console.error('Error redeeming points: ', error);
        window.alert('Redemption failed. Please try again.');
      }
    }
  };

  // Show authentication screens if not signed in
  if (!isAuthenticated && !authLoading) {
    if (view === 'signup') {
      return (
        <div className="bg-gray-100 text-gray-800 font-sans">
          <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg">
            <SignUp onSwitchToSignIn={() => setView('signin')} />
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-100 text-gray-800 font-sans">
        <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg">
          <SignIn onSwitchToSignUp={() => setView('signup')} />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'map':
        return <MapSection />;
      case 'rewards':
        return <RewardsSection points={user?.points || 0} onRedeem={handleRedeem} />;
      case 'home':
      default:
        return <HomeSection onSerialSubmit={handleSerialSubmit} />;
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 font-sans">
      <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg relative pb-20">
        {(loading || authLoading) && <Loader />}
        <Header points={user?.points || 0} user={user} />
        <main className="p-4">{renderView()}</main>
        <Navigation activeView={view} setActiveView={setView} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}