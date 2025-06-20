import React, { useRef, useState, useEffect } from "react";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { WALKIN_COLUMNS } from "@/constant/data/tableColumns";
import WalkinTableRow from "@/component/layout/inquirypage/component/Walkin/WalkinTableRow";
import EngageFormModal from "@/component/layout/inquirypage/component/Walkin/EngageFormModal";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { categoryService } from "@/component/servicesApi/apiCalls/emojiWalkin/categoryService";
import { queueService } from "@/component/servicesApi/apiCalls/emojiWalkin/queueService";
import { branchService } from "@/component/servicesApi/apiCalls/emojiWalkin/branchService";
import { showToast } from "@/util/toastUtil";
import Button from "@/component/layout/inquirypage/component/ui/button";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WalkinPage = () => {
    //States
    const engageFormModalRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [walkinData, setWalkinData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const dataFetchedRef = useRef(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState({ id: "", name: "" });
    const [desks, setDesks] = useState([]);
    const [selectedDesk, setSelectedDesk] = useState({ id: "", name: "" });
    const navigate = useNavigate();
    //Hooks
    // Effect to fetch data only once when component mounts
    useEffect(() => {
        // Skip fetch if we already have data
        if (dataFetchedRef.current) return;

        const fetchWalkinData = async () => {
            setIsLoading(true);
            try {
                const response =
                    await walkinTransactionService.getAllWalkinTransactions();
                const categoryResponse =
                    await categoryService.getAllCategories();
                const branchResponse = await branchService.getAllBranches();
                setBranches(branchResponse || []);
                setWalkinData(response.data || []);
                setCategories(categoryResponse || []);
                dataFetchedRef.current = true;
                setHasError(false);
            } catch (error) {
                setHasError(true);
                setErrorMessage("Failed to load walkin data");
                console.error("Error fetching walkin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWalkinData();
    }, [dataFetchedRef]);

    //Event handler
    const handleOpenModal = (item) => {
        if (engageFormModalRef.current) {
            if (selectedDesk.id === "" || selectedBranch.id === "") {
                showToast(
                    "Please select a branch and a counter/desk first.",
                    "warning"
                );
                return;
            }
            setSelectedItem(item);
            const trimCounter = selectedDesk.name.replace(/\D/g, "");
            //Send to queue monitor - firebase
            const payload = {
                priority_number: item?.priority_number,
                status: "serving",
                counter: trimCounter,
            };

            queueService.updateQueueStatus(payload);
            engageFormModalRef.current.showModal();
        }
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
                                    const branch = branches.find(
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
                                {branches &&
                                    branches.map((branch) => (
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
                <div className="py-4">
                    <CustomTable
                        textAlign="text-center"
                        className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 text-center "
                        tableClassName="w-full min-w-[882px]  "
                        columns={WALKIN_COLUMNS}
                        data={walkinData || []}
                        isLoading={isLoading}
                        renderRow={(item) => (
                            <WalkinTableRow
                                key={item.id}
                                item={item}
                                onOpenModal={handleOpenModal}
                            />
                        )}
                    />
                </div>
            </div>
            <div>
                <EngageFormModal
                    ref={engageFormModalRef}
                    itemData={selectedItem}
                    categories={categories}
                    setSelectedItem={setSelectedItem}
                />
            </div>
        </div>
    );
};

export default WalkinPage;
