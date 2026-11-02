export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || 'EasyInvoice LK';
export const APP_URL = import.meta.env.VITE_APP_URL?.trim() || '';
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || '';

export const AUTHOR_NAME = 'Ishan Fernando';
const authorUrl = import.meta.env.VITE_AUTHOR_FACEBOOK_URL?.trim() || '';
/** Only https links are accepted, so a misconfigured value can never become a javascript: URL. */
export const AUTHOR_FACEBOOK_URL = /^https:\/\//i.test(authorUrl) ? authorUrl : '';

/** Display form of APP_URL without protocol, e.g. "easyinvoice.lk". */
export const APP_URL_DISPLAY = APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const WATERMARK_TEXT = `Created with ${APP_NAME}${APP_URL_DISPLAY ? ` · ${APP_URL_DISPLAY}` : ''}`;
