export const toLowerCaseText = (text) => {
    if (!text) return "";
    // List of property that should stay uppercase
    const acronyms = ["SJMV", "LPU", "CDO", "DGT"];

    // Special case mapping
    const specialCases = {
        "casamira south": "Casa Mira South",
    };

    // Split text into words while preserving parentheses
    const words = text.match(/\([^\)]+\)|[^\s]+/g) || [];

    // Join words first to check for special cases
    const normalizedText = words.join(" ").toLowerCase();

    // Check if the full phrase matches a special case
    if (specialCases[normalizedText]) {
        return specialCases[normalizedText];
    }

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
