import { isEqual } from "lodash";

export const hasFormChanged = (currentData, initialData) => {
    return !isEqual(currentData, initialData);
};
