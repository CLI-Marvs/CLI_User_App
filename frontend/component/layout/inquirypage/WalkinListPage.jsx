import React, { useRef, useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import CustomTable from "frontend/component/layout/propertyandpricingpage/component/CustomTable";
import { WALKIN_COLUMNS } from "frontend/constant/data/tableColumns";
import WalkinTableRow from "frontend/component/layout/inquirypage/component/WalkinList/WalkinTableRow";
import EngageFormModal from "frontend/component/layout/inquirypage/component/WalkinList/EngageFormModal";
import { showToast } from "frontend/util/toastUtil";
import Button from "frontend/component/layout/inquirypage/component/ui/button";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Pagination from "frontend/component/layout/propertyandpricingpage/component/Pagination";
import { useCategories } from "frontend/component/layout/inquirypage/hooks/useCategories";
import { useBranch } from "frontend/component/layout/inquirypage/hooks/useBranch";
import Skeleton from "frontend/component/Skeletons";
import { useWalkinSelection } from "frontend/context/InquiryManagement/WalkinSelectionContext";
import { useWalkinTransactions } from "frontend/component/layout/inquirypage/hooks/useWalkinTransactions";
const WalkinListPage = () => {
    //States
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const engageFormModalRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const {
        selectedBranch,
        setSelectedBranch,
        desks,
        setDesks,
        selectedDesk,
        setSelectedDesk,
    } = useWalkinSelection();
    const navigate = useNavigate();
    const {
        data: walkinData,
        isLoading,
        engageMutation,
    } = useWalkinTransactions({
        page,
        pageSize: PAGE_SIZE,
        selectedBranch,
        selectedDesk,
    });
    const { data: categoriesData } = useCategories();
    const { data: branchesData } = useBranch();

    useEffect(() => {
        if (!selectedBranch?.id || !branchesData) return;

        const branchList = Array.isArray(branchesData)
            ? branchesData
            : branchesData?.data || [];

        if (!branchList.length) return;

        const currentBranch = branchList.find(
            (branch) => String(branch.id) === String(selectedBranch.id)
        );

        if (!currentBranch) return;

        setSelectedBranch((prev) => ({
            ...prev,
            name: currentBranch.name ?? prev.name,
            slug: currentBranch.slug ?? prev.slug,
        }));

        // Update desks dropdown immediately
        setDesks(currentBranch.desks || []);

        // Keep selectedDesk in sync or reset if removed
        if (selectedDesk?.id) {
            const updatedDesk = (currentBranch.desks || []).find(
                (d) => String(d.id) === String(selectedDesk.id)
            );
            if (!updatedDesk) {
                setSelectedDesk({ id: "", name: "" });
            } else {
                setSelectedDesk({ id: String(updatedDesk.id), name: updatedDesk.name });
            }
        }
    }, [branchesData, selectedBranch?.id, selectedDesk?.id]);

    //Event handler
    //Handle engage form modal open
    const handleEngage = async (item) => {
        if (!engageFormModalRef.current) return;
        setSelectedItem(item);
        try {
            await engageMutation.mutateAsync(item);
            // Save to localStorage
            localStorage.setItem("engagedWalkinId", item?.id);
            engageFormModalRef.current.showModal();
        } catch (error) {
            if (
                !error.message.includes("No branch selected") &&
                !error.message.includes("No desk selected")
            ) {
                showToast("Failed to engage transaction.", "error");
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

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
                                        slug: branch ? branch.slug : "",
                                    });
                                    setDesks(branch ? branch.desks : []);
                                }}
                                value={selectedBranch.id ?? ""}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select branch)
                                </option>
                                {branchesData &&
                                    branchesData.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id ?? ""}
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
                                value={selectedDesk?.id ?? ""}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select counter)
                                </option>
                                {desks &&
                                    desks.map((desk) => (
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
                    {!selectedBranch.id || !selectedBranch.id ? (
                        <div className="text-center py-4 text-custom-bluegreen montserrat-medium">
                            Please select a branch and desk first to display
                            walk-in transactions.
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-4">
                            <Skeleton height={140} className="my-1" />
                            <Skeleton height={140} className="my-1" />
                            <Skeleton height={140} className="my-1" />
                        </div>
                    ) : walkinData &&
                        Array.isArray(walkinData?.data) &&
                        walkinData?.data.length === 0 ? (
                        <div className="text-center py-4 text-custom-bluegreen">
                            No walk-in transaction data available.
                        </div>
                    ) : walkinData &&
                        Array.isArray(walkinData.data) &&
                        walkinData.data.length > 0 ? (
                        <CustomTable
                            textAlign="text-center"
                            className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 text-center "
                            tableClassName="w-full min-w-[882px]  "
                            columns={WALKIN_COLUMNS}
                            data={
                                Array.isArray(walkinData?.data)
                                    ? walkinData.data
                                    : []
                            }
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
                            No walk-in transaction data available.
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

export default WalkinListPage;
