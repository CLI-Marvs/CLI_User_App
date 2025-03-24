import { useRef, useState } from "react";
import UploadUnitDetailsModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/UploadUnitDetailsModal";
import expectedHeaders from "@/constant/data/excelHeader";
import * as XLSX from "xlsx";
import { showToast } from "@/util/toastUtil";

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
        const file = event.target.files[0];
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
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

            const reorderedHeaders = expectedHeaders.map((expectedHeader) => {
                // Find the index of the selected header that matches the expected header
                const selectedIndex = selectedHeaders.indexOf(expectedHeader);
                return {
                    rowHeader: expectedHeader,
                    columnIndex: selectedIndex + 1, // Adjust for 1-based column index
                };
            }); //Reorder filtered headers based on expected headers order

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
        };

        reader.readAsArrayBuffer(file);
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
                <p className="montserrat-regular text-center text-red-500">
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
