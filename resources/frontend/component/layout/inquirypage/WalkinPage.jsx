import React, { useRef, useState, useEffect } from "react";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { WALKIN_COLUMNS } from "@/constant/data/tableColumns";
import WalkinTableRow from "@/component/layout/inquirypage/component/Walkin/WalkinTableRow";
import EngageFormModal from "@/component/layout/inquirypage/component/Walkin/EngageFormModal";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { categoryService } from "@/component/servicesApi/apiCalls/emojiWalkin/categoryService";

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
            setSelectedItem(item);
            engageFormModalRef.current.showModal();
        }
    };

    return (
        <div className="h-screen bg-custom-grayFA p-4 flex flex-col gap-[21px]">
            <div>
                {/* Branch */}
                <div className="py-1">
                    <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden w-[350px]">
                        <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1 montserrat-regular">
                            Branch
                        </span>
                        <div className="relative w-full">
                            <select
                                name="user_type"
                                //    value={formData.user_type}
                                //    onChange={handleChange}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select branch)
                                </option>
                                <option value="Property Owner">Branch 1</option>
                                <option value="Buyer">Branch 2</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
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
                                name="user_type"
                                //    value={formData.user_type}
                                //    onChange={handleChange}
                                className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                            >
                                <option value="" className="montserrat-regular">
                                    (Select counter)
                                </option>
                                <option value="Property Owner">Branch 1</option>
                                <option value="Buyer">Branch 2</option>
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
                    {/* <CustomTable
                                            tableClassName="w-full min-w-[882px] px-2"
                                            className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 -mx-1 px-4"
                                            columns={propertySettingColumns}
                                            data={propertyFeatures}
                                            isLoading={isLoading && isFirstLoad}
                                            renderRow={(item) => (
                                                <PropertyFeatureTableRow
                                                    key={item.id}
                                                    
                                                    handleOpenModal={handleOpenModal}
                                                    propertySettingColumns={propertySettingColumns}
                                                />
                                            )}
                                        /> */}
                </div>
            </div>
            <div>
                <EngageFormModal
                    ref={engageFormModalRef}
                    itemData={selectedItem}
                    categories={categories}
                />
            </div>
        </div>
    );
};

export default WalkinPage;
