/**
 * Utility module for managing browser cookies & authentication session state.
 */

export function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const valString = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(valString)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  if (!matches) return null;
  const decoded = decodeURIComponent(matches[1]);
  if (!decoded || decoded === 'undefined' || decoded === 'null') return null;
  return decoded;
}

export function getCookieJson(name) {
  const val = getCookie(name);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// Dedicated Admin Session Helpers
export function getAdminToken() {
  return getCookie('askme_admin_token') || getCookie('askme_token');
}

export function getAdminUser() {
  return getCookieJson('askme_admin_user') || getCookieJson('askme_user');
}

export function setAdminSession(token, user) {
  if (token) setCookie('askme_admin_token', token);
  if (user) setCookie('askme_admin_user', user);
}

export function clearAdminSession() {
  removeCookie('askme_admin_token');
  removeCookie('askme_admin_user');
}

// Dedicated Creator Session Helpers
export function getCreatorToken() {
  return getCookie('askme_token');
}

export function getCreatorUser() {
  return getCookieJson('askme_user');
}

export function setCreatorSession(token, user) {
  if (token) setCookie('askme_token', token);
  if (user) setCookie('askme_user', user);
}

export function clearCreatorSession() {
  removeCookie('askme_token');
  removeCookie('askme_user');
}
