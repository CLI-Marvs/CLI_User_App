// utils/stringUtils.js
export const normalizeValue = (value) => {
  return value
    ?.toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "") 
    .trim();
};

export const levenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,    
          matrix[i - 1][j] + 1 
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const valueExistsFuzzy = (existingList, newValue, field, threshold = 0.8) => {
  const normalizedNew = normalizeValue(newValue);

  return existingList.some(item => {
    const existingValue = normalizeValue(field ? item[field] : item);
    const maxLength = Math.max(existingValue.length, normalizedNew.length);
    if (maxLength === 0) return false;

    const distance = levenshteinDistance(existingValue, normalizedNew);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  });
};
