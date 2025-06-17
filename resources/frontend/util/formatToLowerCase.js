/* eslint-disable security/detect-object-injection */
export const toLowerCaseText = (text) => {
    if (!text) return "";

    // If the text ends with a space, preserve it
    const endsWithSpace = text.endsWith(" ");

    // List of property that should stay uppercase
    const acronyms = ["SJMV", "LPU", "CDO", "DGT"];

    // Special case mapping
    const specialCases = {
        "casamira south": "Casa Mira South",
    };

    // Split text into words while preserving parentheses
    // eslint-disable-next-line no-useless-escape
    const words = text.trim().match(/\([^\)]+\)|[^\s]+/g) || [];

    // Join words first to check for special cases
    const normalizedText = words.join(" ").toLowerCase();

    // Check if the full phrase matches a special case
    if (specialCases[normalizedText]) {
        return specialCases[normalizedText] + (endsWithSpace ? " " : "");
    }

    const formattedText = words
        .map((word) => {
            // Check if the word is inside parentheses
            if (word.startsWith("(") && word.endsWith(")")) {
                const innerWord = word.slice(1, -1);
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

    // Preserve trailing space if it existed in the input
    return formattedText + (endsWithSpace ? " " : "");
};

// Helper function to capitalize a word
const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
