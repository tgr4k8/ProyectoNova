// Central API/BASE config (normalizado)
const RAW = process.env.REACT_APP_API || process.env.REACT_APP_API_URL || '/api';

// API sin barra final (=> "/api")
export const API = String(RAW || '/api').replace(/\/$/, '');

// BASE = host del backend (si API == "/api", BASE = "")
export const BASE = API.replace(/\/api$/, '');
