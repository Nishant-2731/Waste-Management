import React, { useState } from 'react';

export default function HomeSection({ onSerialSubmit }) {
  const [serial, setSerial] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!serial) {
      setError('Serial number cannot be empty.');
      return;
    }
    if (!serial.match(/^[A-Z0-9]{11,15}$/)) {
      setError('Invalid serial number format.');
      return;
    }
    setError('');
    onSerialSubmit(serial);
    setSerial('');
  };

  return (
    <section>
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Register Your Device for Recycling
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="serial-number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter Device Serial Number
          </label>
          <input
            type="text"
            id="serial-number"
            value={serial}
            onChange={e => setSerial(e.target.value.toUpperCase())}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., RZ8N81ABCDE"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-4 hover:bg-blue-800 transition duration-300"
          >
            <i className="fa-solid fa-magnifying-glass mr-2"></i> Find Nearest Center
          </button>
        </form>
      </div>
      <div className="mt-6 text-center">
        <img
          src="https://placehold.co/300x200/E8F5E9/333333?text=Eco-Friendly+Recycling"
          alt="Eco-friendly recycling"
          className="mx-auto rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">
          Join us in creating a sustainable future. Recycling your old devices helps
          protect the planet.
        </p>
      </div>
    </section>
  );
}