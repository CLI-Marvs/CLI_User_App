import { useRef, useState } from "react";
import UploadUnitDetailsModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/UploadUnitDetailsModal";
import expectedHeaders from "@/constant/data/excelHeader";
import * as XLSX from "xlsx";
import { showToast } from "@/util/toastUtil";
import { SPREADSHEET_FILE_EXTENSIONS } from "@/constant/data/spreadSheetExtension";
import { unitService } from "@/component/servicesApi/apiCalls/propertyPricing/unit/unitService";

const UnitUploadButton = ({
    linkText = "Upload",
    buttonType = "button",
    buttonText = "",
    className = "",
    priceListData,
    ...props
}) => {
    //States
    const uploadUnitModalRef = useRef(null);
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [excelDataRows, setExcelDataRows] = useState([]);
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);

    //Event handler
    //Handle to open the unit upload modal
    const handleOpenUnitUploadModal = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    //Handle close the unit upload modal
    const handleCloseModal = () => {
        // Reset file input field
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Reset state variables
        setFileName("");

        // Close modal
        if (uploadUnitModalRef.current) {
            uploadUnitModalRef.current.close();
        }
    };

    /**
     * Handles the process of uploading an Excel file, extracting the headers
     */
    const handleFileChange = async (event) => {
        try {
            const file = event.target.files[0];

            setFileName(file.name);
            const reader = new FileReader();
            const extension = file && file?.name.split(".").pop().toLowerCase();

            //Check if the file is an Excel file
            if (!SPREADSHEET_FILE_EXTENSIONS.includes(extension)) {
                showToast(
                    "Invalid file format. Please upload a valid Excel file.",
                    "error"
                );
                return;
            }
            // Check if the file size exceeds 5MB
            if (file.size > 5 * 1024 * 1024) {
                showToast(
                    "File size exceeds the 5MB limit. Please upload a smaller file.",
                    "error"
                );
                return;
            }

            //Scan the file for viruses
            const formData = new FormData();
            formData.append("file", file);
            const response = await unitService.scanFile(formData);
            console.log("response", response);
            return;
            // Handle backend errors
            // if (response?.data?.errors?.file) {
            //     console.log("response insidet the if statement", response);

            //     showToast(response.data.errors.file[0], "error");
            //     return;
            // }

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                    }); //all data in excel

                    const selectedHeaders = jsonData[0]; // First row contains headers
                    const dataRows = jsonData.slice(1); // All rows after the first one

                    // Normalize empty values to `null` and Remove empty rows
                    const normalizedDataRows = dataRows
                        .map((row) =>
                            selectedHeaders.map((_, index) =>
                                row[index] !== undefined ? row[index] : null
                            )
                        )
                        .filter((row) => row.some((value) => value !== null)); // Remove completely empty rows

                    setExcelDataRows(normalizedDataRows);

                    // Check for missing headers
                    const missingHeaders = expectedHeaders.filter(
                        (header) => !selectedHeaders.includes(header)
                    );

                    //Check for extra headers
                    const extraHeaders = selectedHeaders.filter(
                        (header) => !expectedHeaders.includes(header)
                    );

                    // Notify user if missing headers are found
                    if (missingHeaders.length > 0) {
                        showToast(
                            `Please check your Excel header row.\nMissing Headers: ${missingHeaders.join(
                                ", "
                            )}`,
                            "warning"
                        );
                        setSelectedExcelHeader([]);
                        return;
                    }

                    // Notify user if extra headers are found, but continue with expected headers
                    if (extraHeaders.length > 0) {
                        showToast(
                            `Please check your Excel header row.\nExtra Headers: ${extraHeaders.join(
                                ", "
                            )}\nProcessing will continue with expected headers only.`,
                            "warning"
                        );
                    }

                    const reorderedHeaders = expectedHeaders.map(
                        (expectedHeader) => {
                            // Find the index of the selected header that matches the expected header
                            const selectedIndex =
                                selectedHeaders.indexOf(expectedHeader);
                            return {
                                rowHeader: expectedHeader,
                                columnIndex: selectedIndex + 1, // Adjust for 1-based column index
                            };
                        }
                    ); //Reorder filtered headers based on expected headers order

                    // Reorder data rows based on this mapping
                    const reorderedData = dataRows.map((row) => {
                        const reorderedRow = {};
                        reorderedHeaders.forEach((headerMapping) => {
                            reorderedRow[headerMapping.rowHeader] =
                                row[headerMapping.columnIndex];
                        });
                        return reorderedRow;
                    });

                    //  console.log("reorderedData", reorderedData);
                    // Save the formatted headers
                    setSelectedExcelHeader(reorderedHeaders);

                    // Proceed with your modal display logic
                    if (uploadUnitModalRef.current) {
                        uploadUnitModalRef.current.showModal();
                    }
                } catch (error) {
                    console.error("Error reading file:", error);
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error in handleFileChange:", error);
            showToast(
                "An unexpected error occurred. Please try again.",
                "error"
            );
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {buttonType === "button" ? (
                <button
                    onClick={handleOpenUnitUploadModal}
                    className={`${className} w-auto px-3`}
                >
                    {buttonText}
                </button>
            ) : (
                <p className="montserrat-regular text-center text-red-500 py-2">
                    No units have been uploaded.
                    <span
                        className="underline ml-2 text-blue-500 w-80 cursor-pointer"
                        onClick={handleOpenUnitUploadModal}
                    >
                        {linkText}
                    </span>
                </p>
            )}

            <div>
                <UploadUnitDetailsModal
                    excelDataRows={excelDataRows}
                    onClose={handleCloseModal}
                    priceListData={priceListData}
                    handleFileChange={handleFileChange}
                    uploadUnitModalRef={uploadUnitModalRef}
                    fileName={fileName}
                    selectedExcelHeader={selectedExcelHeader}
                    setAccordionStates={props.setAccordionStates}
                    expectedHeaders={expectedHeaders}
                />
            </div>
        </div>
    );
};

export default UnitUploadButton;
