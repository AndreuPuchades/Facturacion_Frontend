import { useAuthStore } from "@/stores/auth.js";

const server = import.meta.env.VITE_URL_API;

export default class BaseRepository {
    constructor() {
        this.authStore = useAuthStore();
    }

    async fetchWithAuth(url, options = {}) {
        const token = this.authStore.token;
        const defaultOptions = {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: 'include'
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${server}${url}`, mergedOptions);

            if (!response.ok) {
                if (response.status === 401) {
                    this.authStore.logout();
                }
                let errorData;
                try {
                    errorData = await response.json();
                } catch (error) {
                    errorData = { message: response.statusText };
                }
                console.error('API Error:', errorData);
                throw new Error(`${response.status} ${response.statusText} at ${url}: ${JSON.stringify(errorData)}`);
            }

            return response.json();
        } catch (error) {
            console.error("Network error:", error);
            throw error;
        }
    }
}