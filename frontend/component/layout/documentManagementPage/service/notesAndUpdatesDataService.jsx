import apiService from "../../../servicesApi/apiService";

let cache = {
    data: null,
    promise: null,
    timestamp: null,
    params: null,
};

const CACHE_DURATION = 10 * 1000;

const fetchNotesAndUpdatesDataInternal = ({
    selectedAccountId,
    selectedWorkOrder,
    workOrderId,
    workOrderGroupId,
    prefetch = false,
    force = false,
} = {}) => {
    const now = Date.now();
    const isCacheFresh =
        cache.data &&
        cache.timestamp &&
        cache.params &&
        cache.params.selectedAccountId === selectedAccountId &&
        cache.params.selectedWorkOrder === selectedWorkOrder &&
        cache.params.workOrderId === workOrderId &&
        cache.params.workOrderGroupId === workOrderGroupId &&
        now - cache.timestamp < CACHE_DURATION;

    if (!force && isCacheFresh) {
        return Promise.resolve(cache.data);
    }

    if (cache.promise && !force) {
        return cache.promise;
    }

    let url = `/get-account-logs/${selectedAccountId}?log_type=${encodeURIComponent(selectedWorkOrder)}`;

    if (selectedWorkOrder === 'All Steps' && workOrderGroupId) {
        url += `&work_order_group_id=${workOrderGroupId}`;
    } else if (workOrderId) {
        url += `&work_order_id=${workOrderId}`;
    }

    cache.promise = apiService.get(url).then((response) => {
        cache.data = response.data;
        cache.timestamp = Date.now();
        cache.params = { selectedAccountId, selectedWorkOrder, workOrderId, workOrderGroupId };
        cache.promise = null;
        return cache.data;
    }).catch((err) => {
        cache.promise = null;
        if (prefetch) {
            console.warn("Notes and updates prefetching failed silently.", err);
            return;
        }
        throw err;
    });

    return cache.promise;
};

export const getNotesAndUpdatesData = (params) =>
    fetchNotesAndUpdatesDataInternal({ ...params, force: false });

export const revalidateNotesAndUpdatesData = (params) =>
    fetchNotesAndUpdatesDataInternal({ ...params, force: true });

export const prefetchNotesAndUpdatesData = (params) => {
    const now = Date.now();
    const isCacheStale =
        !cache.timestamp ||
        !cache.params ||
        cache.params.selectedAccountId !== params.selectedAccountId ||
        cache.params.selectedWorkOrder !== params.selectedWorkOrder ||
        cache.params.workOrderId !== params.workOrderId ||
        cache.params.workOrderGroupId !== params.workOrderGroupId ||
        now - cache.timestamp >= CACHE_DURATION;
    if ((!cache.data || isCacheStale) && !cache.promise) {
        fetchNotesAndUpdatesDataInternal({ ...params, prefetch: true });
    }
};

export const getCachedNotesAndUpdatesData = (params) => {
    const now = Date.now();
    if (
        cache.data &&
        cache.timestamp &&
        cache.params &&
        cache.params.selectedAccountId === params.selectedAccountId &&
        cache.params.selectedWorkOrder === params.selectedWorkOrder &&
        cache.params.workOrderId === params.workOrderId &&
        cache.params.workOrderGroupId === params.workOrderGroupId &&
        now - cache.timestamp < CACHE_DURATION
    ) {
        return cache.data;
    }
    return null;
};

export const invalidateNotesAndUpdatesData = (params) => {
    if (!params || (cache.params &&
        cache.params.selectedAccountId === params.selectedAccountId &&
        cache.params.selectedWorkOrder === params.selectedWorkOrder &&
        cache.params.workOrderId === params.workOrderId &&
        cache.params.workOrderGroupId === params.workOrderGroupId)) {
        cache.data = null;
        cache.promise = null;
        cache.timestamp = null;
        cache.params = null;
    }
};
