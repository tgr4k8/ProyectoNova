
import { API, BASE } from '../config';

export function assetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/uploads')) return BASE + path;
    return path;
}