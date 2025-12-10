import axios from 'axios';

declare global {
    interface Window {
        APP_CONFIG: {
            API_URL: string;
        };
    }
}

const api = axios.create({
    baseURL: window.APP_CONFIG?.API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
