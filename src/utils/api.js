// src/utils/api.js
export const API_BASE =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API ||
    'http://novaclub.eba-kpqfdpwa.eu-west-1.elasticbeanstalk.com/api';

export const apiFetch = (path, opts = {}) =>
    fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts,
    });
