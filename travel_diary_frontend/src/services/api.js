// src/services/api.js
import axios from 'axios';

// Create a customized Axios instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/', // Pointing to your Django backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Automatically attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized globally (e.g., expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If the token is expired, clear storage and force login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // NEW: Make sure we clear the user data too!
            localStorage.removeItem('user'); 
            
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;