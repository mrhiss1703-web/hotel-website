// Node-based data tests do not have Vite's import.meta.env.
const base = import.meta.env?.BASE_URL ?? '/';
export const publicAsset = path => `${base}${path}`;
