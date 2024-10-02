import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const useFileUpload = (expectedHeaders) => {
    console.log("expectedHeaders useFileUpload", expectedHeaders);
    const [tempUploadedExcelData, setTempUploadedExcelData] = useState([]);
    const [fileSelected, setFileSelected] = useState(null);
    const [fileName, setFileName] = useState("");
    const uploadUnitModalRef = useRef(null); // Assuming you'll pass the modal reference


    // open the modal to select an excel file
    // const handleOpenUnitUploadModal = () => {
    //     if (fileInputRef.current) {
    //         fileInputRef.current.click();
    //     }
    // };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setFileSelected(file);
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

            // Check for missing headers
            const missingHeaders = expectedHeaders.filter(
                (header) => !selectedHeaders.includes(header)
            );

            // Check for extra headers
            const extraHeaders = selectedHeaders.filter(
                (header) => !expectedHeaders.includes(header)
            );

            // Notify user if missing headers are found
            if (missingHeaders.length > 0) {
                alert(
                    `Please check your Excel header row.\nMissing Headers: ${missingHeaders.join(
                        ", "
                    )}`
                );
                setTempUploadedExcelData([]);
                return;
            }

            // Notify user if extra headers are found, but continue with expected headers
            if (extraHeaders.length > 0) {
                alert(
                    `Please check your Excel header row.\nExtra Headers: ${extraHeaders.join(
                        ", "
                    )}\nProcessing will continue with expected headers only.`
                );
            }

            // Filter selected headers to only keep expected ones
            const filteredHeaders = selectedHeaders.filter((header) =>
                expectedHeaders.includes(header)
            );

            const reorderedHeaders = expectedHeaders.map((expectedHeader) => {
                // Find the index of the selected header that matches the expected header
                const selectedIndex = selectedHeaders.indexOf(expectedHeader);
                return {
                    header: expectedHeader,
                    column: selectedIndex + 1, // Adjust for 1-based column index
                };
            }); //Reorder filtered headers based on expected headers order

            // const formattedHeaders = reorderedHeaders.map((header, index) => ({
            //     header: header,
            //     column: selectedHeaders.indexOf(header) + 1, // Get the original column index
            // }));
            // console.log("formattedHeaders", formattedHeaders);

            console.log("reorderedHeaders", reorderedHeaders);
            // Save the formatted headers for further use
            setTempUploadedExcelData(reorderedHeaders);

            // Proceed with your modal display logic
            if (uploadUnitModalRef.current) {
                uploadUnitModalRef.current.showModal();
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return {
        handleFileChange,
        tempUploadedExcelData,
        fileSelected,
        fileName,
        uploadUnitModalRef,
         
       
    };
};

export default useFileUpload;
