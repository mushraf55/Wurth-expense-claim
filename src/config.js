// API base URL — update VITE_API_URL env var when deploying to Render
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE;
