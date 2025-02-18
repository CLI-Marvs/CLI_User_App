export const toLowerCaseText = (text) => {
    return (
        text?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) || ""
    );
};
