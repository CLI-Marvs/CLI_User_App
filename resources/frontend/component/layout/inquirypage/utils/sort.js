export function sortByNameAlphabetically(array, alwaysLast = []) {
    return [...array].sort((a, b) => {
        if (alwaysLast.includes(a.name) && !alwaysLast.includes(b.name)) return 1;
        if (!alwaysLast.includes(a.name) && alwaysLast.includes(b.name)) return -1;
        return a.name.localeCompare(b.name);
    });
}