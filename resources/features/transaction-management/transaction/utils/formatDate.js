  export const formatDate = (dateStr, mode = "text") => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const spaceYear = String(year).split("").join("\u200A");
        if (mode === "boxes") return `${month} ${day} ${year}`;
        if (mode === "spaced")
            return `${month}\u00A0\u00A0${day}\u00A0\u00A0${spaceYear}`;
        return `${month}/${day}/${year}`;
    };