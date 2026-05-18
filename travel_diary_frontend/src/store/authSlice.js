import { createSlice } from '@reduxjs/toolkit';

// NEW: Helper function to safely parse the user object on page refresh
const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        return null;
    }
};

const initialState = {
    isAuthenticated: !!localStorage.getItem('access_token'),
    user: getUserFromStorage(), // Automatically reloads the role on refresh
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            
            // Save tokens
            localStorage.setItem('access_token', action.payload.access);
            localStorage.setItem('refresh_token', action.payload.refresh);
            
            // NEW: Save the user profile (including role) as a JSON string
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            
            // Clear everything on logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user'); // NEW
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;