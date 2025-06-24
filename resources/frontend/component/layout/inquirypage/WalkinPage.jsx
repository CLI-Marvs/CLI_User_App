import React, { useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { WALKIN_COLUMNS } from "@/constant/data/tableColumns";
import WalkinTableRow from "@/component/layout/inquirypage/component/Walkin/WalkinTableRow";
import EngageFormModal from "@/component/layout/inquirypage/component/Walkin/EngageFormModal";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { queueService } from "@/component/servicesApi/apiCalls/emojiWalkin/queueService";
import { branchService } from "@/component/servicesApi/apiCalls/emojiWalkin/branchService";
import { showToast } from "@/util/toastUtil";
import Button from "@/component/layout/inquirypage/component/ui/button";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { useCategories } from "@/component/layout/inquirypage/hooks/useCategories";
import Skeleton from "@/component/Skeletons";

const WalkinPage = () => {
    //States
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const engageFormModalRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    {
        /* TODO: confirm this because it will handle many users, confirm also if to use passcode  */
    }
    const [selectedBranch, setSelectedBranch] = useState({ id: "", name: "" });
    const [desks, setDesks] = useState([]);
    const [selectedDesk, setSelectedDesk] = useState({ id: "", name: "" });
    const navigate = useNavigate();
    const {
        data: walkinData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["queueWalkinTransactions", page],
        queryFn: () =>
            walkinTransactionService.getQueuedWalkinTransactions(
                page,
                PAGE_SIZE
            ),
        keepPreviousData: true,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
        refetchInterval: 10000,
    });
    const queryClient = useQueryClient();
    const { data: categoriesData } = useCategories();
    const { data: branchesData } = useQuery({
        queryKey: ["queueBranches"],
        queryFn: () => branchService.getAllBranches(),
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
    });

    //Event handler
    //Handle engage form modal open
    const handleEngage = async (item) => {
        if (!engageFormModalRef.current) return;

        if (selectedDesk.id === "" || selectedBranch.id === "") {
            showToast(
                "Please select a branch and a counter/desk first.",
                "warning"
            );
            return;
        }

        setSelectedItem(item);
        const trimCounter = selectedDesk.name.replace(/\D/g, "");

        try {
            // Update the status
            await walkinTransactionService.updateWalkinTransactionStatus({
                walkin_transaction_id: item?.id,
                status: "serving",
            });

            // Invalidate the query to refresh the list
            queryClient.invalidateQueries({
                queryKey: ["queueWalkinTransactions", page],
            });

            // Send to queue monitor - firebase
            const payload = {
                priority_number: item?.priority_number,
                status: "serving",
                counter: trimCounter,
            };
            queueService.updateQueueStatus(payload);

            engageFormModalRef.current.showModal();
        } catch (error) {
            showToast("Failed to engage transaction.", "error");
            console.error(error);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (isError) {
        return (
            <div className="text-red-500 py-1   justify-between items-center h-screen bg-custom-grayFA p-4 flex flex-col gap-[21px]">
                <h1 className="montserrat-regular">Error loading data: {isError}</h1>
            </div>
        );
    }

    return (
        <div className="h-screen bg-custom-grayFA p-4 flex flex-col gap-[21px]">
            <div>
                {/* Branch */}
                <div className="py-1 flex justify-between items-center">
                    <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden w-[350px]">
                        <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1 montserrat-regular">
                            Branch
                        </span>
                        <div className="relative w-full">
                            <select
                                name="branch_id"
                                onChange={(e) => {
                                    const branchId = e.target.value;
                                    const branch = branchesData.find(
                                        (b) => String(b.id) === branchId
                                    );
                                    setSelectedBranch({
                                        id: branchId,
                                        name: branch ? branch.name : "",
                                    });
                                    setDesks(branch ? branch.desks : []);
                                }}
                                value={selectedBranch.id}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select branch)
                                </option>
                                {branchesData &&
                                    branchesData.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                    <div className=" ">
                        <Button
                            className="border border-custom-bluegreen w-[150px] h-[35px] rounded-[5px] text-sm bg-white text-custom-bluegreen montserrat-semibold flex items-center justify-center gap-4 hover:shadow-custom4"
                            onClick={() => {
                                navigate("/inquirymanagement/walk-in/history");
                            }}
                        >
                            <span>
                                <FaHistory className="w-5 h-5" />
                            </span>
                            History
                        </Button>
                    </div>
                </div>

                {/* Counter/desk */}
                <div className="py-1">
                    <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden w-[350px]">
                        <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1 montserrat-regular">
                            Counter/Desk
                        </span>
                        <div className="relative w-full">
                            <select
                                name="desk_id"
                                onChange={(e) => {
                                    const deskId = e.target.value;
                                    const desk = desks.find(
                                        (d) => String(d.id) === deskId
                                    );
                                    setSelectedDesk({
                                        id: deskId,
                                        name: desk ? desk.name : "",
                                    });
                                }}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select counter)
                                </option>
                                {desks.map((desk) => (
                                    <option key={desk.id} value={desk.id}>
                                        {desk.name}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-3 mx-1 py-4">
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Skeleton height={140} className="my-1" />
                            <Skeleton height={140} className="my-1" />
                            <Skeleton height={140} className="my-1" />
                        </div>
                    ) : walkinData &&
                      Array.isArray(walkinData.data) &&
                      walkinData.data.length === 0 ? (
                        <div className="text-center py-4 text-custom-bluegreen">
                            No walkin transaction data
                        </div>
                    ) : walkinData &&
                      Array.isArray(walkinData.data) &&
                      walkinData.data.length > 0 ? (
                        <CustomTable
                            textAlign="text-center"
                            className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 text-center "
                            tableClassName="w-full min-w-[882px]  "
                            columns={WALKIN_COLUMNS}
                            data={walkinData.data}
                            isLoading={isLoading}
                            renderRow={(item) => (
                                <WalkinTableRow
                                    key={item.id}
                                    item={item}
                                    onOpenModal={handleEngage}
                                />
                            )}
                        />
                    ) : (
                        <div className="text-center py-4 text-custom-bluegreen">
                            No walkin transaction data
                        </div>
                    )}

                    <div className="mt-2 flex justify-end">
                        <Pagination
                            pageCount={walkinData?.last_page || 1}
                            currentPage={walkinData?.current || 1}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
            <div>
                <EngageFormModal
                    ref={engageFormModalRef}
                    itemData={selectedItem}
                    categories={categoriesData}
                    setSelectedItem={setSelectedItem}
                />
            </div>
        </div>
    );
};

export default WalkinPage;
