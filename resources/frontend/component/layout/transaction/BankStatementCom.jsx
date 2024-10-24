import { Card } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import CircularProgress from "@mui/material/CircularProgress";
import { set } from "lodash";
import DataMatchTable from "./DataMatchTable";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiServiceSap from "../../servicesApi/apiServiceSap";

const BankStatementCom = () => {
    const {
        transactions,
        setCurrentPageTransaction,
        currentPageTransations,
        transactionsPageCount,
        getTransactions,
        getMatches,
        matchesData,
        bankNames,
        setBankNames,
        bankList,
    } = useStateContext();
    const [files, setFiles] = useState([]);
    const modalRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        e.target.value = null;
    };

    const handlePageChange = (data) => {
        const selectedPage = data.selected;
        setCurrentPageTransaction(selectedPage);
    };

    const handleRemoveFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const handleCancel = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
        setFiles([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(); // Use FormData for file uploads
        files.forEach((file) => formData.append("notepadFile[]", file));
        setLoading(true);
        try {
            const response = await apiService.post("upload-notepad", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("response", response);
            setLoading(false);
            if (modalRef.current) {
                modalRef.current.close();
            }
            setFiles([]);
            getTransactions();
        } catch (error) {
            console.log("error uploading data", error);
        }
    };

    const updateRecords = async () => {
        try {
            const response = await apiService.post("update-transaction");
        } catch (error) {
            console.log("error updating", error);
        }
    };

    const handleSubmitSap = async () => {
        setLoading(true);
        try {
            for (const item of matchesData) {
                let soapBody = `
                    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
                    <soap:Header/>
                    <soap:Body>
                       <urn:ZdataWarehousePosted>
                          <LtZcol>
                             <item>
                                <Id>${item.ID}</Id>
                                <Bukrs>${item.BUKRS}</Bukrs>
                                <Recnnr>${item.RECNNR}</Recnnr>
                                <Vbewa>${item.VBEWA}</Vbewa>
                                <Belnr>${item.BELNR}</Belnr>
                                <Amt>${item.AMT}</Amt>
                                <Payd>${item.PAYD}</Payd>
                             </item>
                          </LtZcol>
                       </urn:ZdataWarehousePosted>
                    </soap:Body>
                    </soap:Envelope>`;

                // Make the API call for the current item
                const response = await apiServiceSap.post(
                    "post-data-sap",
                    soapBody
                );

                // Optionally, handle the response here if needed
                console.log(`Item ${item.ID} posted:`, response.data);
            }

            getMatches();
            getTransactions(); // Call to update transactions after all items are processed

            if (modalRef.current) {
                modalRef.current.close();
            }
            setLoading(false); // End loading

            toast.success("All Data Posted Successfully!");
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
            setLoading(false);
        }
    };

    //     const handleSubmitSap = async () => {
    //         console.log("matchesData", matchesData);
    //         setLoading(true); // Start loading

    //         const batchSize = 10; // Number of items per batch
    //         const maxRetries = 3; // Max retries for failed requests
    //         const resultsLog = []; // Array to log results

    //         const sendBatch = async (batch) => {
    //             let soapBody = `
    //            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
    //    <soap:Header/>
    //             <soap:Body>
    //                <urn:ZdataWarehousePosted>
    //                   <LtZcol>`;

    //             batch.forEach((item) => {
    //                 soapBody += `
    //                      <item>
    //                         <Id>${item.ID}</Id>
    //                         <Bukrs>${item.BUKRS}</Bukrs>
    //                         <Recnnr>${item.RECNNR}</Recnnr>
    //                         <Vbewa>${item.VBEWA}</Vbewa>
    //                         <Belnr>${item.BELNR}</Belnr>
    //                         <Amt>${item.AMT}</Amt>
    //                         <Payd>${item.PAYD}</Payd>
    //                      </item>`;
    //             });

    //             soapBody += `
    //                   </LtZcol>
    //                </urn:ZdataWarehousePosted>
    //             </soap:Body>
    //             </soap:Envelope>`;

    //             console.log("Sending batch:", soapBody);

    //             try {
    //                 const response = await apiServiceSap.post(
    //                     "post-data-sap",
    //                     soapBody
    //                 );
    //                 console.log("Response for batch:", response.data);
    //             } catch (error) {
    //                 console.error(
    //                     `Error on attempt ${attempt + 1}:`,
    //                     error.response ? error.response.data : error.message
    //                 );

    //             }
    //         };

    //         // Loop through matchesData in batches
    //         for (let i = 0; i < matchesData.length; i += batchSize) {
    //             const batch = matchesData.slice(i, i + batchSize);
    //             await sendBatch(batch); // Send the current batch
    //         }

    //         getTransactions();
    //         if (modalRef.current) {
    //             modalRef.current.close();
    //         }
    //         setLoading(false); // End loading

    //         // Log results

    //         console.log("Batch Processing Results:", resultsLog);
    //         toast.success("Data Posted Successfully!");
    //     };

    const handleBankChange = (e) => {
        setBankNames(e.target.value);
    };

    const openPostingModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    useEffect(() => {
        if (files.length > 0 && modalRef.current) {
            modalRef.current.showModal();
        }
        getMatches();
    }, [files]);
    useEffect(() => {
        getTransactions();
    }, []);
    return (
        <>
            <div className="px-4">
                <ToastContainer position="top-center" />
                <div className="flex mb-4 gap-10">
                    <select
                        className="border-b-1 w-[121px] outline-none text-sm"
                        value={bankNames}
                        onChange={handleBankChange}
                    >
                        <option value="">Select Banks</option>
                        <option value="All">All</option>
                        {bankList.length > 0 &&
                            bankList.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                    </select>
                    <input
                        type="file"
                        id="fileInput"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e)}
                    />
                    <button
                        onClick={() =>
                            document.getElementById("fileInput").click()
                        }
                        className="px-10 gradient-btn5 text-white text-sm rounded-[10px]"
                    >
                        Upload Transaction Report
                    </button>
                    <button
                        /* onClick={sendSoapRequest} */
                        className="h-[38px] w-[121px] outline-none gradient-btn5 text-white  text-xs rounded-[10px]"
                        onClick={openPostingModal}
                    >
                        {" "}
                        Run Auto Posting
                    </button>
                </div>

                {/* Table */}
                <table className="min-w-full bg-white border border-gray-500 border-collapse">
                    <thead>
                        <tr>
                            <th className=" px-4 border border-gray-500">
                                Date
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Bank
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Payment Channel
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Transact By
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Contract No/ Reference No.
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Status
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Document Number
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Invoice Link
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Collection Receipt Link
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 &&
                            transactions.map((item, index) => (
                                <tr key={index}>
                                    <td className=" px-4 border border-gray-500">
                                        {item.transaction_date}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.bank_name}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.payment_channel}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.transact_by}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.reference_number}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.status === "not_posted"
                                            ? "Not Posted"
                                            : "Posted"}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.document_number}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.invoice_link}
                                    </td>
                                    <td className="px-4 border border-gray-500">
                                        <a
                                            href={item.collection_receipt_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {item.collection_receipt_link}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <ReactPaginate
                            previousLabel={
                                <MdKeyboardArrowLeft className="text-[#404B52]" />
                            }
                            nextLabel={
                                <MdKeyboardArrowRight className="text-[#404B52]" />
                            }
                            breakLabel={"..."}
                            pageCount={transactionsPageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageChange}
                            containerClassName={"flex gap-2"}
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            pageClassName=" border border-[#EEEEEE] bg- text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName={
                                "text-gray-300 cursor-not-allowed"
                            }
                            forcePage={currentPageTransations}
                        />
                    </div>
                </div>
            </div>
            <dialog
                id="Employment"
                className="modal w-[589px] rounded-[10px] shadow-custom5 backdrop:bg-black/50 px-4 py-4"
                ref={modalRef}
            >
                {files && files.length > 0 ? (
                    <>
                        <div className="flex flex-col text-md mb-4">
                            <div>These are files to be uploaded</div>
                            {files.length > 0 && (
                                <div className="mt-4">
                                    <ul>
                                        {files.map((file, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between"
                                            >
                                                {file.name}
                                                {/*  <button
                                                    onClick={() =>
                                                        handleRemoveFile(index)
                                                    }
                                                    className="text-red-500 ml-4"
                                                >
                                                    Remove
                                                </button> */}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                /* onClick={sendSoapRequest} */
                                className="h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
                                onClick={handleCancel}
                            >
                                {" "}
                                Cancel
                            </button>
                            <button
                                onClick={(e) => handleSubmit(e)}
                                disabled={loading}
                                type="submit"
                                className={`w-[133px] text-sm montserrat-semibold text-white h-[40px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4
                                                ${
                                                    loading
                                                        ? "cursor-not-allowed"
                                                        : ""
                                                }
                                                `}
                            >
                                {loading ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>
                                        Submit
                                        <IoIosSend />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col text-md mb-4">
                            <DataMatchTable matchesData={matchesData} />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                /* onClick={sendSoapRequest} */
                                className="h-[38px] outline-none w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
                                onClick={handleCancel}
                            >
                                {" "}
                                Cancel
                            </button>
                            <button
                                onClick={(e) => handleSubmitSap(e)}
                                disabled={loading}
                                type="submit"
                                className={`w-[133px] text-sm montserrat-semibold text-white h-[40px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4
                                                ${
                                                    loading
                                                        ? "cursor-not-allowed"
                                                        : ""
                                                }
                                                `}
                            >
                                {loading ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>
                                        Post
                                        <IoIosSend />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </dialog>
        </>
    );
};

export default BankStatementCom;
