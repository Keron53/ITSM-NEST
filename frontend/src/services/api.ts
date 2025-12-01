import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1', // Adjust if your backend runs on a different port
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
