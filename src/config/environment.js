/**
 * Unified Environment Configuration for WEBBY CLASSROOM
 * Supports seamless switching across:
 * 1. Localhost Development (PC)
 * 2. LAN Wi-Fi IP (Phone & PC in same classroom)
 * 3. Vercel Production Deployment
 */

const getWindow = () => {
  return typeof window !== 'undefined' ? window : null;
};

// 1. Detect runtime environment
export const detectAppEnv = () => {
  if (import.meta.env?.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV;
  }
  const win = getWindow();
  if (!win || !win.location) return 'development';
  const hostname = win.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  // Check private IP ranges (LAN)
  if (
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return 'lan';
  }
  return 'production';
};

export const APP_ENV = detectAppEnv();

// 2. Resolve API Base URL
export const getApiBaseUrl = () => {
  // If explicitly specified in .env, honor it
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  const win = getWindow();
  if (win && win.location) {
    if (win.location.protocol === 'file:') {
      return 'http://127.0.0.1:3001/api';
    }
    // In both Vite dev server (proxied) and Vercel (rewritten), relative /api is clean & avoids CORS
    return '/api';
  }

  return 'http://127.0.0.1:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

// 3. Resolve Frontend App Base URL for Mobile QR Join
export const getAppBaseUrl = () => {
  if (import.meta.env?.VITE_APP_BASE_URL) {
    return import.meta.env.VITE_APP_BASE_URL.replace(/\/+$/, '');
  }

  const win = getWindow();
  if (!win || !win.location) return 'http://localhost:5173';

  // In production (Vercel), use actual protocol and host without dev port
  if (APP_ENV === 'production') {
    return `${win.location.protocol}//${win.location.host}`;
  }

  // In LAN mode, use current LAN IP host
  if (APP_ENV === 'lan') {
    return `${win.location.protocol}//${win.location.host}`;
  }

  // In localhost development, fallback to localhost port 5173
  return `${win.location.protocol}//${win.location.host}`;
};

// 4. Generate Join Room URL for Mobile Scanner
export const buildRoomJoinUrl = (roomCode = 'WB-601', lanIp = null) => {
  const win = getWindow();
  const env = detectAppEnv();

  if (env === 'production') {
    const origin = win?.location ? `${win.location.protocol}//${win.location.host}` : 'https://studio-game.vercel.app';
    return `${origin}/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
  }

  if (lanIp && (env === 'development' || env === 'lan')) {
    return `http://${lanIp}:5173/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
  }

  if (win?.location?.hostname && win.location.hostname !== 'localhost' && win.location.hostname !== '127.0.0.1') {
    return `${win.location.protocol}//${win.location.host}/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
  }

  // Default development fallback
  return `http://localhost:5173/?room=${encodeURIComponent(roomCode)}&mode=mobile`;
};

// 5. Generate QR Code Payload for Student Card (Standardized)
export const buildStudentCardPayload = (cardId, studentCode = '', classId = 'CLASS_6A') => {
  return JSON.stringify({
    type: 'WEBBY_STUDENT_CARD',
    cardId: cardId || 'CARD_0001',
    studentCode: studentCode || '',
    classId: classId || 'CLASS_6A',
    version: 1
  });
};

