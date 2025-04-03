import { VALID_FILE_EXTENSIONS } from "@/constant/data/validFile";

export const SPREADSHEET_FILE_EXTENSIONS = VALID_FILE_EXTENSIONS.filter((ext) =>
    ["xls", "xlsx", "xlsm", "xml", "csv"].includes(ext)
);