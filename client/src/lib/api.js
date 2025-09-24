const jsonHeaders = { 'Content-Type': 'application/json' };

// Ensure a stable anonymous uid in localStorage
export const getOrCreateUID = () => {
  let uid = localStorage.getItem('wm_uid');
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('wm_uid', uid);
  }
  return uid;
};

export const fetchUser = async (uid) => {
  const res = await fetch(`/api/users/${uid}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json(); // { uid, points }
};

export const awardPoints = async (uid, amount, reason, serial) => {
  const res = await fetch(`/api/users/${uid}/award`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ amount, reason, serial })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to award points');
  }
  return res.json(); // { uid, points }
};

export const redeemPoints = async (uid, cost, name) => {
  const res = await fetch(`/api/users/${uid}/redeem`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ cost, name })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to redeem points');
  }
  return res.json(); // { uid, points }
};