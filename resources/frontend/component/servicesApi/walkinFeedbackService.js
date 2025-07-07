import axios from "axios";

const WALKIN_FEEDBACK_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL;
const username = import.meta.env.VITE_AUTH_WALKIN_USERNAME;
const password = import.meta.env.VITE_AUTH_WALKIN_PASSWORD;
const basicAuth = btoa(`${username}:${password}`);

const walkinFeedbackService = axios.create({
    baseURL: `${WALKIN_FEEDBACK_BASE_URL}/api/v1/emoji-walkin`,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
    },
});

walkinFeedbackService.interceptors.request.use((config) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        const token = csrfToken.getAttribute("content");
        if (token) {
            config.headers["X-CSRF-TOKEN"] = token;
        }
    }

    return config;
});

export default walkinFeedbackService;
