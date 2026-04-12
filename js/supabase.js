// Sharecar — Supabase Client v2.0
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ktqiyywdgokktiwavgbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UqkqWGlqU0Slw7a4azOoGg_l8E3vUYP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Auth helpers ───────────────────────────────────────────────────────────

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = '/app/auth.html';
    return null;
  }
  return user;
}

// ─── Level system ────────────────────────────────────────────────────────────

export const LEVELS = [
  { id: 'bronze',  label: 'Bronze',  min: 0,   icon: '🥉', discount: 0,    color: '#cd7f32' },
  { id: 'silver',  label: 'Silver',  min: 5,   icon: '🥈', discount: 5,    color: '#a8a9ad' },
  { id: 'gold',    label: 'Gold',    min: 15,  icon: '🥇', discount: 10,   color: '#ffd700' },
  { id: 'premium', label: 'Premium', min: 30,  icon: '💎', discount: 15,   color: '#a855f7' },
  { id: 'vip',     label: 'VIP',     min: 60,  icon: '👑', discount: 20,   color: '#f59e0b' },
];

export function getLevel(trips) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (trips >= l.min) level = l;
  }
  return level;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export function showToast(msg, type = 'info') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      background:#1e1e2e; color:#fff; padding:12px 24px; border-radius:12px;
      font-size:14px; font-weight:500; z-index:9999; opacity:0;
      transition:opacity .3s; pointer-events:none; max-width:320px; text-align:center;
      box-shadow:0 4px 24px rgba(0,0,0,.4);
    `;
    document.body.appendChild(toast);
  }
  const colors = { info: '#3b82f6', success: '#22c55e', error: '#ef4444', warn: '#f59e0b' };
  toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
