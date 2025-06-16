export const toLowerCaseText = (text) => {
    if (!text) return "";

    // List of property that should stay uppercase
    const acronyms = ["SJMV", "LPU", "CDO", "DGT"];

    // Split text into words while preserving parentheses
    const words = text.match(/\([^\)]+\)|[^\s]+/g) || [];

    return words
        .map((word) => {
            // Check if the word is inside parentheses
            if (word.startsWith("(") && word.endsWith(")")) {
                const innerWord = word.slice(1, -1); // Extract text inside parentheses
                return acronyms.includes(innerWord.toUpperCase())
                    ? `(${innerWord.toUpperCase()})`
                    : `(${capitalize(innerWord)})`;
            }

            // Handle acronyms & regular words
            return acronyms.includes(word.toUpperCase())
                ? word.toUpperCase()
                : capitalize(word);
        })
        .join(" ");
};

// Helper function to capitalize a word
const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
