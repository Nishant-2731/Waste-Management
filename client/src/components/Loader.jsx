import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
    </div>
  );
}