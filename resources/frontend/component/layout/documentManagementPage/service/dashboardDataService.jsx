import apiService from "../../../../component/servicesApi/apiService";

let cache = {
    data: null,
    promise: null,
    timestamp: null,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchDashboardDataInternal = ({
    prefetch = false,
    force = false,
} = {}) => {
    const now = Date.now();
    // Return cached data if it's fresh
    const isCacheFresh =
        cache.data && cache.timestamp && now - cache.timestamp < CACHE_DURATION;

    // If not forcing and cache is fresh, resolve with cached data immediately.
    if (!force && isCacheFresh) {
        return Promise.resolve(cache.data);
    }

    // If a fetch is already in progress, return the existing promise
    if (cache.promise) {
        return cache.promise;
    }

    // Start a new fetch
    cache.promise = apiService
        .get("/dashboard/executive")
        .then((response) => {
            cache.data = response.data;
            cache.timestamp = Date.now();
            cache.promise = null;
            return cache.data;
        })
        .catch((err) => {
            cache.promise = null;
            if (prefetch) {
                console.warn(
                    "Dashboard data prefetching failed silently.",
                    err
                );
                return;
            }
            throw err;
        });

    return cache.promise;
};

export const getDashboardData = () => {
    return fetchDashboardDataInternal({ force: false });
};

export const revalidateDashboardData = () => {
    return fetchDashboardDataInternal({ force: true });
};

export const prefetchDashboardData = () => {
    const now = Date.now();
    const isCacheStale =
        !cache.timestamp || now - cache.timestamp >= CACHE_DURATION;
    // Only prefetch if data isn't fresh and not currently being fetched.
    if ((!cache.data || isCacheStale) && !cache.promise) {
        fetchDashboardDataInternal({ prefetch: true });
    }
};

export const getCachedDashboardData = () => {
    const now = Date.now();
    if (
        cache.data &&
        cache.timestamp &&
        now - cache.timestamp < CACHE_DURATION
    ) {
        return cache.data;
    }
    return null;
};

export const invalidateDashboardData = () => {
    cache.data = null;
    cache.promise = null;
    cache.timestamp = null;
};
