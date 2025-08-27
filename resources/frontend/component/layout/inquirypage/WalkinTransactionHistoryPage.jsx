import React, { useState } from "react";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import WalkinHistoryTableRow from "@/component/layout/inquirypage/component/WalkinList/WalkinHistoryTableRow";
import Skeleton from "@/component/Skeletons";
import { WALKIN_HISTORY_COLUMNS } from "@/constant/data/tableColumns";
import { useQuery } from "@tanstack/react-query";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { useCategories } from "@/component/layout/inquirypage/hooks/useCategories";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import Button from "@/component/layout/inquirypage/component/ui/button";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import WalkinTransactionModal from "@/component/layout/inquirypage/component/WalkinList/WalkinTransactionModal";
import { useWalkinSelection } from "@/context/InquiryManagement/WalkinSelectionContext";
import { useSurvey } from "@/context/Survey/SurveyContext";

const INITIAL_SEARCH_STATE = {
    full_name: "",
    priority_number: "",
    inquiry_type: "",
    status: "",
};

const WalkinTransactionHistoryPage = () => {
    //States
    const { fetchSurveyStatus } = useSurvey();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const [searchValues, setSearchValues] = useState(INITIAL_SEARCH_STATE);
    const [activeSearch, setActiveSearch] = useState(searchValues);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const { selectedBranch } = useWalkinSelection();
    const {
        data: transactionHistory,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: [
            "walkinTransactionHistory",
            page,
            activeSearch,
            selectedBranch.slug,
        ],
        queryFn: () =>
            walkinTransactionService.getWalkinTransactionsHistory(
                page,
                PAGE_SIZE,
                activeSearch,
                selectedBranch.slug
            ),
        enabled: !!selectedBranch.slug,
        keepPreviousData: true,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
        refetchInterval: 15000, // refetch every 10 seconds
        refetchIntervalInBackground: false, // pause interval when tab is not focused
        refetchOnWindowFocus: true, // refetch once when tab regains focus
    });
    const { data: categoriesData } = useCategories();
    const fields = [
        { name: "full_name", label: "Full Name" },
        { name: "priority_number", label: "Priority Number" },
        {
            name: "inquiry_type",
            label: "Category",
            type: "select",
            defaultValue: "",
            options: [
                { label: "Select Category", value: "" },
                ...(categoriesData
                    ? categoriesData.map((item) => ({
                          label: item?.name,
                          value: item?.id,
                      }))
                    : []),
            ],
        },
        {
            name: "status",
            label: "Satus",
            type: "select",
            defaultValue: "",
            options: [
                { label: "Select Status", value: "" },
                { label: "Saved", value: "saved" },
                { label: "Resolved", value: "resolved" },
                { label: "Rated", value: "rated" },
            ],
        },
    ];

    // Handles input change: updates search values based on user input
    const handleInputChange = ({ target: { name, value } }) => {
        setSearchValues((prev) => ({ ...prev, [name]: value }));
    };

    // Handles search submission: sets search parameters and refetches data
    const handleSearchSubmit = () => {
        const hasValues = Object.values(searchValues).some(Boolean);
        if (hasValues) {
            setActiveSearch(searchValues);
            setPage(1);
            refetch();
        }
    };

    // Handles filter reset: clears search values and resets filters
    const handleResetFilters = () => {
        setSearchValues(INITIAL_SEARCH_STATE);
        setActiveSearch({});
        setPage(1);
        refetch();
    };

    // Handles page change: updates the current page and refetches data
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    //Handle click item
    const handleClickItem = async (item) => {
        if (item?.ticket_id) {
            await fetchSurveyStatus(item.ticket_id);
        }
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px] flex flex-col">
            <div className="flex justify-start items-center gap-2  ">
                <Button
                    className="  w-[100px] h-[35px] rounded-[5px] text-sm  text-custom-bluegreen montserrat-semibold flex items-center justify-center gap-4 hover:shadow-custom4"
                    onClick={() => navigate(-1)}
                >
                    <span>
                        <FaArrowLeft className="w-5 h-5" />
                    </span>
                    Back
                </Button>
            </div>
            <div className="px-2 flex justify-start items-center gap-4 mt-3">
                <div>
                    <p className="montserrat-medium text-custom-bluegreen">
                        Walk-in Transaction History
                    </p>
                </div>
            </div>
            <div className="mt-4 px-0">
                {" "}
                <TransactionSearchBar
                    fields={fields}
                    searchValues={searchValues}
                    setSearchValues={setSearchValues}
                    onChangeSearch={handleInputChange}
                    onSubmit={handleSearchSubmit}
                    setFilters={handleResetFilters}
                />
            </div>

            <div className="mt-3 mx-2 py-4">
                {isLoading && !isFetching ? (
                    <div className="text-center py-4">
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                        <Skeleton height={140} className="my-1" />
                    </div>
                ) : Array.isArray(transactionHistory?.data) &&
                  transactionHistory.data.length === 0 ? (
                    <div className="text-center py-4 text-custom-bluegreen">
                        No data available.
                    </div>
                ) : Array.isArray(transactionHistory?.data) &&
                  transactionHistory.data.length > 0 ? (
                    <CustomTable
                        tableClassName="w-full min-w-[882px]"
                        className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen"
                        columns={WALKIN_HISTORY_COLUMNS}
                        data={transactionHistory.data}
                        isLoading={isLoading}
                        renderRow={(item) => (
                            <WalkinHistoryTableRow
                                key={item.id}
                                item={item}
                                onClick={() => handleClickItem(item)}
                            />
                        )}
                    />
                ) : (
                    <div className="text-center py-4 text-custom-bluegreen">
                        No data available.
                    </div>
                )}

                <div className="mt-2 flex justify-end">
                    <Pagination
                        pageCount={transactionHistory?.last_page || 1}
                        currentPage={transactionHistory?.current_page || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
            <div>
                <WalkinTransactionModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    item={selectedItem}
                />
            </div>
        </div>
    );
};

export default WalkinTransactionHistoryPage;
