import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Header from './components/Header.jsx';
import Loader from './components/Loader.jsx';
import HomeSection from './components/HomeSection.jsx';
import MapSection from './components/MapSection.jsx';
import RewardsSection from './components/RewardsSection.jsx';
import Navigation from './components/Navigation.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';

import { awardPoints, redeemPoints } from './lib/api.js';

function AuthenticatedApp() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState('home'); // 'home' | 'map' | 'rewards'
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load user points when user is authenticated
  useEffect(() => {
    if (user) {
      setPoints(user.points || 0);
    }
  }, [user]);

  const handleSerialSubmit = async (serial) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await awardPoints(user.uid, 100, 'device-serial', serial);
      setPoints(data.points);
      alert('Success! 100 Eco-Points have been added to your account.');
      setView('map');
    } catch (error) {
      console.error('Error awarding points:', error);
      alert('There was an issue awarding points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (cost, name) => {
    if (!user) return;
    if (points < cost) {
      alert("You don't have enough points for this item.");
      return;
    }
    if (window.confirm(`Are you sure you want to redeem "${name}" for ${cost} points?`)) {
      setLoading(true);
      try {
        const data = await redeemPoints(user.uid, cost, name);
        setPoints(data.points);
        alert('Redemption successful!');
      } catch (error) {
        console.error('Error redeeming points:', error);
        alert(error.message || 'Redemption failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderView = () => {
    switch (view) {
      case 'map':
        return <MapSection />;
      case 'rewards':
        return <RewardsSection points={points} onRedeem={handleRedeem} />;
      case 'home':
      default:
        return <HomeSection onSerialSubmit={handleSerialSubmit} />;
    }
  };

  if (authLoading) {
    return (
      <div className="bg-gray-100 text-gray-800 font-sans">
        <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg relative">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-800 font-sans">
      <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg relative pb-20">
        {loading && <Loader />}
        <Header points={points} />
        <main className="p-4">{renderView()}</main>
        <Navigation activeView={view} setActiveView={setView} />
      </div>
    </div>
  );
}

function AuthWrapper() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('signin'); // 'signin' | 'signup'

  if (loading) {
    return (
      <div className="bg-gray-100 text-gray-800 font-sans">
        <div className="container mx-auto max-w-lg min-h-screen bg-white shadow-lg relative">
          <Loader />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'signin' ? (
      <SignIn onSwitchToSignUp={() => setAuthView('signup')} />
    ) : (
      <SignUp onSwitchToSignIn={() => setAuthView('signin')} />
    );
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}