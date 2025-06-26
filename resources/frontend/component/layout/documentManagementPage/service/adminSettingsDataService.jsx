import apiService from "../../../../component/servicesApi/apiService";

let cache = {
    data: null,
    promise: null,
    timestamp: null,
};

const CACHE_DURATION = 5 * 60 * 1000; 

const fetchAdminSettingsDataInternal = ({ prefetch = false, force = false } = {}) => {
    const now = Date.now();
    // Return cached data if it's fresh
    const isCacheFresh = cache.data && cache.timestamp && (now - cache.timestamp < CACHE_DURATION);

    // If not forcing and cache is fresh, resolve with cached data immediately.
    if (!force && isCacheFresh) {
        return Promise.resolve(cache.data);
    }

    // If a fetch is already in progress, return the existing promise
    if (cache.promise) {
        return cache.promise;
    }

    // Start a new fetch
    cache.promise = apiService.get("/admin/settings/work-order-types")
        .then(response => {
            cache.data = response.data;
            cache.timestamp = Date.now();
            cache.promise = null;
            return cache.data;
        })
        .catch(err => {
            cache.promise = null;
            if (prefetch) {
                console.warn("Admin settings data prefetching failed silently.", err);
                return; 
            }
            throw err;
        });

    return cache.promise;
};

export const getAdminSettingsData = () => fetchAdminSettingsDataInternal({ force: false });
export const revalidateAdminSettingsData = () => fetchAdminSettingsDataInternal({ force: true });
export const prefetchAdminSettingsData = () => {
    const now = Date.now();
    const isCacheStale = !cache.timestamp || (now - cache.timestamp >= CACHE_DURATION);
    if ((!cache.data || isCacheStale) && !cache.promise) {
        fetchAdminSettingsDataInternal({ prefetch: true });
    }
};
export const getCachedAdminSettingsData = () => {
    const now = Date.now();
    if (cache.data && cache.timestamp && (now - cache.timestamp < CACHE_DURATION)) {
        return cache.data;
    }
    return null;
};
export const invalidateAdminSettingsData = () => {
    cache.data = null;
    cache.promise = null;
    cache.timestamp = null;
};

