import { useEffect, useState } from "react";
import PostingTableCell from "./PostingTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import Skeletons from "@/component/Skeletons";
import apiServiceSap from "@/component/servicesApi/apiServiceSap";
import { useStateContext } from "@/context/contextprovider";
import { toLowerCaseText } from "@/util/formatToLowerCase";

const AutoPostingCom = () => {
    const statuses = ["Cleared", "Posted", "Floating"];

    const labelStatuses = [
        {
            statusRef: "Cleared",
            name: "For Clearing",
        },
        {
            statusRef: "Posted",
            name: "For Posting",
        },
        {
            statusRef: "Floating",
            name: "For Floating",
        },
    ];

    const dynamicClass = (item) =>
        item === "Floating"
            ? "bg-[#FFFCD9]"
            : item === "Posted"
            ? "bg-[#EAF1FA]"
            : "bg-[#ECFCE6]";

    const { propertyNamesList } = useStateContext();
    const {
        postingList,
        setPostingList,
        currentPagePosting,
        setCurrentPagePosting,
        totalPagePosting,
        setTotalPagePosting,
        activeItemTransaction,
        setActiveItemTransaction,
    } = useTransactionContext();
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusToPost, setStatusPost] = useState([]);
    const [isSelectedAll, setIsSelectedAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchValues, setSearchValues] = useState({});
    const [dataSearch, setDataSearch] = useState({});
    const skeletonRows = 5;

    const pageHandler = async (data = {}) => {
        if (data.response.length === 0 && data.currentPage > 1) {
            const newPage = data.currentPage - 1;
            await setCurrentPagePosting(newPage);
            return;
        }
        if (data.response.length === 0 && data.currentPage === 1) {
            await setCurrentPagePosting(0);
            return;
        }
    };

    const getPostingList = async (isUpdate = false) => {
        if (isUpdate) {
            setLoading(true);
        }
        const filter = activeItemTransaction
            ? { ...dataSearch, status: activeItemTransaction }
            : {};

        const response = await transaction.transactionList(
            currentPagePosting,
            filter
        );

        if (isUpdate) {
            await pageHandler({
                response: response.data,
                currentPage: currentPagePosting,
            });
        }
        setPostingList(response.data);
        setTotalPagePosting(response.last_page);
        setLoading(false);
    };

    const handleActiveItem = (item) => {
        setActiveItemTransaction((prev) => (prev === item ? "Cleared" : item));
        setCurrentPagePosting(0);
        setSelectedRows([]);
        setStatusPost([]);
        setIsSelectedAll(false);
        setDataSearch({});
    };

    const handleUpdateItems = async (item) => {
        let payload = [];
        const statusRef = labelStatuses
            .filter((ref) => ref.name === item)
            .map((item) => item.statusRef);

        if (statusRef.length > 0) {
            const updatedRows = selectedRows.map((row) => ({
                ...row,
                statusRef: statusRef[0],
            }));

            payload = updatedRows;
        }

        if (item === "For Posting") {
            await handleSubmitSap();
        }
        await transaction.transactionUpdate(payload);
        await getPostingList(true);
        setIsSelectedAll(false);
        setStatusPost([]);
    };

    const handlePageClick = (data) => {
        setCurrentPagePosting(data.selected);
    };

    useEffect(() => {
        getPostingList();
    }, [currentPagePosting, activeItemTransaction, dataSearch]);

    const handleCheckboxChange = (item) => {
        setSelectedRows((prev) =>
            prev.some((row) => row.id === item.transaction_id)
                ? prev.filter((row) => row.id !== item.transaction_id)
                : [...prev, { id: item.transaction_id, status: item.status }]
        );
        setStatusPost(
            labelStatuses
                .filter((ref) => ref.statusRef !== item.status)
                .map((item) => item.name)
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setIsSelectedAll(true);
            const selectedItems = postingList.map((row) => ({
                id: row.transaction_id,
                status: row.status,
            }));

            const selectedStatuses = selectedItems.map((item) => item.status);

            setSelectedRows(selectedItems);
            setStatusPost(
                labelStatuses
                    .filter((ref) => !selectedStatuses.includes(ref.statusRef))
                    .map((item) => item.name)
            );
        } else {
            setIsSelectedAll(false);
            setSelectedRows([]);
        }
    };

    const handleSubmitSap = async () => {
        const newDataObject = postingList.map((item) => {
            return {
                ID: item.transaction_id,
                BUKRS: item.company_code,
                RECNNR: item.reference_number,
                VBEWA: item.flow_type,
                BELNR: item.invoice_number?.toString() || "",
                AMT: item.amount,
                PAYD: "Cash",
                INVID: item.invoice_id,
            };
        });
        try {
            for (const item of newDataObject) {
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
                                <InvId>${item.INVID}</InvId>
                             </item>
                          </LtZcol>
                       </urn:ZdataWarehousePosted>
                    </soap:Body>
                    </soap:Envelope>`;

                const response = await apiServiceSap.post(
                    "post-data-sap",
                    soapBody
                );
            }
            alert("All Data Posted Successfully!");
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
            alert("Sometine went wrong. Please refresh the page");
        }
    };

    const handleSearchValue = (e) => {
        const { name, value } = e.target;
        setSearchValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmit = () => {
        setDataSearch(searchValues);
        setSearchValues({});
    };

    const columns = [
        {
            header: (
                <>
                    <div className="flex gap-5 items-center relative">
                        <input
                            id="select-all"
                            type="checkbox"
                            className="opacity-0 absolute w-6 h-6 peer"
                            checked={isSelectedAll}
                            onChange={(e) => handleSelectAll(e)}
                        />
                        <label
                            htmlFor="select-all"
                            className={`w-6 h-6 border-[#FFFFFF] peer-checked:bg-[#FFFFFF] rounded-sm peer-checked:text-[#348017] cursor-pointer flex items-center justify-center ${
                                isSelectedAll ? "" : "border-2"
                            }`}
                        >
                            {isSelectedAll && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12l4 4L19 7" />
                                </svg>
                            )}
                        </label>
                        <span>Select All</span>
                    </div>
                </>
            ),
            accessor: "checkbox",
            render: (row) => {
                const isChecked = selectedRows.some(
                    (selected) => selected.id === row.transaction_id
                );
                return (
                    <div className="w-[100px]">
                        <input
                            id={`checkbox-${row.transaction_id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(row)}
                            className="hidden peer"
                        />
                        <label
                            htmlFor={`checkbox-${row.transaction_id}`}
                            className={`w-6 h-6 border-[#348017] peer-checked:bg-[#348017] rounded-sm peer-checked:text-white cursor-pointer flex items-center justify-center ${
                                isChecked ? "" : "border-2"
                            }`}
                        >
                            {isChecked && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12l4 4L19 7" />
                                </svg>
                            )}
                        </label>
                    </div>
                );
            },
        },
        {
            header: "Transaction",
            accessor: "transaction",
            render: (row) => <PostingTableCell type="transaction" row={row} />,
        },

        {
            header: "Details",
            accessor: "details",
            render: (row) => <PostingTableCell type="details" row={row} />,
        },
        {
            header: "Amount",
            accessor: "amount",
            render: (row) => <PostingTableCell type="amount" row={row} />,
        },
        {
            header: "Payment Method",
            accessor: "payment_method",
            render: (row) => (
                <PostingTableCell type="payment_method" row={row} />
            ),
        },
        {
            header: "Status",
            accessor: "status",
            render: (row) => <PostingTableCell type="status" row={row} />,
        },
        {
            header: "Receipt",
            accessor: "collection_receipt_link",
            render: (row) => (
                <PostingTableCell type="collection_receipt_link" row={row} />
            ),
        },
        {
            header: "Destination Bank",
            accessor: "destination_bank",
            render: (row) => (
                <PostingTableCell type="destination_bank" row={row} />
            ),
        },
    ];

    const fields = [
        { name: "customer_name", label: "Customer Name" },
        { name: "email", label: "Email" },
        {
            name: "destination_bank",
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" },
                { label: "BDO", value: "BDO" },
                { label: "BPI", value: "BPI" },
                { label: "LANDBANK", value: "LANDBANK" },
            ],
        },
        {
            name: "property_name",
            label: "Project Name",
            type: "select",
            options: [
                { label: "Select Project", value: "" },
                ...propertyNamesList.map((item) => {
                    return { label: toLowerCaseText(item), value: item };
                }),
            ],
        },
        { name: "invoice_number", label: "Invoice Number" },
        { name: "document_number", label: "Document Number" },
        { name: "reference_number", label: "Reference Number" },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Select Status", value: "" },
                { label: "Cleared", value: "Cleared" },
                { label: "Posted", value: "Posted" },
                { label: "Floating", value: "Floating" },
            ],
        },
        { name: "date_range", type: "date_range", label: "Date" },
    ];

    return (
        <div className="overflow-y-hidden px-3 flex flex-col space-y-1">
            <div className="px-2">
                <TransactionSearchBar
                    fields={fields}
                    searchValues={searchValues}
                    setSearchValues={setSearchValues}
                    onChangeSearch={handleSearchValue}
                    onSubmit={onSubmit}
                />
            </div>
            <div className="flex justify-between px-2">
                <div className="flex gap-[21px]">
                    {statuses.map((item, index) => {
                        return (
                            <div
                                className={`w-[143px] h-[37px] shadow-custom12 mt-5 rounded-md flex items-center justify-center cursor-pointer ${dynamicClass(
                                    item
                                )} ${
                                    activeItemTransaction === item
                                        ? "bg-[#F1F1F1] shadow-custom13"
                                        : ""
                                }`}
                                key={index}
                                onClick={() => handleActiveItem(item)}
                            >
                                <button className="montserrat-medium text-sm">
                                    {item}
                                </button>
                            </div>
                        );
                    })}
                </div>
                {selectedRows.length > 0 && (
                    <div className="flex gap-[21px]">
                        {statusToPost.map((item, index) => {
                            return (
                                <div
                                    className={`w-[143px] h-[37px] shadow-custom12 mt-5 rounded-md flex items-center justify-center cursor-pointer`}
                                    key={index}
                                    onClick={() => handleUpdateItems(item)}
                                >
                                    <button className="px-4 py-2 w-[143px] h-[37px] text-white font-semibold rounded-lg bg-gradient-to-r from-[#348017] to-[#175D5F] hover:opacity-90 transition duration-300">
                                        {item}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="overflow-x-auto px-2">
                <table className="border-separate border-spacing-y-2 w-full min-w-max">
                    <thead>
                        <tr className="text-white bg-custom-lightgreen">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="border-r-[1px] border-[#B9B7B7] px-[10px] py-[16px] text-sm shadow-custom12 font-semibold text-center"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <>
                                {[...Array(skeletonRows)].map((_, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="border-r-[1px] border-opacity-10 border-[#B9B7B7] shadow-custom11"
                                    >
                                        {columns.map((_, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className="px-3 py-3 w-[208px] text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7]"
                                            >
                                                <Skeletons height={20} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </>
                        ) : postingList && postingList.length > 0 ? (
                            postingList.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-r-[1px] border-opacity-10 border-[#B9B7B7] shadow-custom11"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-3 py-3 cursor-pointer w-[208px] text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7] relative ${dynamicClass(
                                                row.status
                                            )}`}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-4 text-gray-500"
                                >
                                    No data to show.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        pageCount={totalPagePosting}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={"flex gap-2"}
                        previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                        nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                        pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                        activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                        pageLinkClassName="w-full h-full flex justify-center items-center"
                        activeLinkClassName="w-full h-full flex justify-center items-center"
                        disabledLinkClassName={
                            "text-gray-300 cursor-not-allowed"
                        }
                        forcePage={currentPagePosting}
                    />
                </div>
            </div>
        </div>
    );
};

export default AutoPostingCom;
