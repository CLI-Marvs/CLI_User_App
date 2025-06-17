import axios from "axios";

const WALKIN_FEEDBACK_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL;

const walkinFeedbackService = axios.create({
    baseURL: `${WALKIN_FEEDBACK_BASE_URL}/api/v1/emoji-walkin`,
    headers: {
        "Content-Type": "application/json",
    },
});

walkinFeedbackService.interceptors.request.use((config) => {
    // const csrfToken = document.querySelector('meta[name="csrf-token"]');
    // const token = localStorage.getItem("authToken");
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    const userToken = localStorage.getItem("authToken");
    if (csrfToken) {
        const token = csrfToken.getAttribute("content");
        if (token) {
            config.headers["X-CSRF-TOKEN"] = token;
        }

        if (userToken) {
            config.headers["Authorization"] = `Bearer ${userToken}`;
        }
    }
    return config;
});

export default walkinFeedbackService;
