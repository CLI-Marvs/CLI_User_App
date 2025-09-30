export function paginate(array, { page = 1, pageSize = 5 } = {}) {
    if (!Array.isArray(array)) return [];
    const start = (page - 1) * pageSize;
    return array.slice(start, start + pageSize);
}
