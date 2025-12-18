export const normalizeData = (data) => {
    if (!data) return {}; // Return an empty object if data is null or undefined
    return {
        department_id: data.id ?? data.department_id,
        features: (data.features || []).map((feature) => ({
            id: feature.id,
            name: feature.name,
            pivot: {
                can_read: feature.pivot.can_read,
                can_write: feature.pivot.can_write,
                can_execute: feature.pivot.can_execute,
                can_delete: feature.pivot.can_delete,
                can_save: feature.pivot.can_save,
            },
        })),
    };
};
