import axios from 'axios';

const API = axios.create({
    baseURL: 'https://quiz-exam-portal-4rqm.onrender.com/api',
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
