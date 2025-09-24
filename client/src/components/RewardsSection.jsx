import React from 'react';

const REWARDS = [
  { id: 1, name: 'Galaxy SmartTag2', points: 500, img: 'https://placehold.co/150x150/000000/FFFFFF?text=SmartTag' },
  { id: 2, name: '$20 Store Voucher', points: 1000, img: 'https://placehold.co/150x150/1428a0/FFFFFF?text=%2420' },
  { id: 3, name: 'Galaxy Buds FE', points: 2500, img: 'https://placehold.co/150x150/EEEEEE/333333?text=Buds' },
  { id: 4, name: 'Wireless Charger Pad', points: 1500, img: 'https://placehold.co/150x150/333333/FFFFFF?text=Charger' },
];

export default function RewardsSection({ points, onRedeem }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Redeem Your Eco-Points</h2>
      <div className="grid grid-cols-2 gap-4">
        {REWARDS.map(reward => {
          const canAfford = points >= reward.points;
          return (
            <div
              key={reward.id}
              className="border rounded-lg p-3 text-center shadow-md flex flex-col justify-between"
            >
              <div>
                <img
                  src={reward.img}
                  alt={reward.name}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold text-sm">{reward.name}</h3>
                <p className="text-xs text-green-700 font-bold my-1">{reward.points} points</p>
              </div>
              <button
                onClick={() => onRedeem(reward.points, reward.name)}
                disabled={!canAfford}
                className={`w-full text-xs py-2 px-3 rounded-md transition mt-2 ${
                  canAfford
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Redeem
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}