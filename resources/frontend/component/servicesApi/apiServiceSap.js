import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const username = "KBELMONTE";
const password = "Tomorrowbytogether2019!";
const authHeader = "Basic " + btoa(`${username}:${password}`);

const apiServiceSap = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "text/xml", 
    Authorization: authHeader,
  },
});

apiServiceSap.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  const userToken = localStorage.getItem('authToken');
  if (csrfToken) {
    const token = csrfToken.getAttribute("content");
    if (token) {
      config.headers["X-CSRF-TOKEN"] = token;
    }

    if(userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    }
  }
  return config;
});

export default apiServiceSap;
