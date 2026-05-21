import axios from 'axios';

const api = axios.create({
    // FIX 1: Added v1/ so it matches your Django urls.py exactly
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1/',
});

// ---------------- REQUEST INTERCEPTOR ----------------
// Automatically attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ---------------- RESPONSE INTERCEPTOR ----------------
// Handle expired access token automatically
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // If token expired and request not retried yet
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                // FIX 2: Use vanilla axios here! This prevents an infinite loop 
                // if the refresh token itself is also expired.
                const response = await axios.post('http://127.0.0.1:8000/api/v1/users/refresh/', {
                    refresh: refreshToken,
                });

                // Save new access token
                localStorage.setItem('access_token', response.data.access);

                // Update authorization header
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token also expired or invalid
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;