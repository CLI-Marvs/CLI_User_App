import React, { useState, useEffect, useRef } from "react";
import "@/component/layout/propertyandpricingpage/style/togglebtn.css";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { MdRefresh } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import AddPropertyModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/Property/AddPropertyModal";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { showToast } from "@/util/toastUtil";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import CustomInput from "@/component/Input/CustomInput";
import CustomToolTip from "@/component/CustomToolTip";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import PricelistMasterRow from "@/component/layout/propertyandpricingpage/component/TableRows/PriceListMasterRow";

const COLUMNS = [
    { label: "Status", width: "w-[100px]" },
    { label: "Property", width: "w-[150px]" },
    { label: "Price Settings", width: "w-[200px]" },
    { label: "Price Version", width: "w-[150px]" },
    { label: "Sold Per Version", width: "w-[150px]" },
    { label: "Promos", width: "w-[100px]" },
    { label: "Payment Schemes", width: "w-[150px]" },
];
const PricingMasterList = () => {
    //States
    const {
        data: priceListMaster,
        isLoading,
        pageState,
        setPageState,
        fetchData,
        isFirstLoad,
        searchFilters,
        setSearchFilters,
        applySearch,
        refreshPage,
        defaultFilters,
    } = usePriceListMaster();
    const [toggled, setToggled] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const propertyModalRef = useRef(null);

    //Hooks
    //Hide the search filter dropdown when clicking outside of it
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsFilterVisible(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    //Event handler
    //Handle search filter input change
    const onInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    //Handle search filter date change
    const handleDateChange = (date) => {
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            date: date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : null,
        }));
    };

    //Handle filter search button
    const handleSearch = async () => {
        applySearch(searchFilters);
    };

    //Handle refresh page
    const handleRefreshPage = () => {
        setSearchFilters(defaultFilters);
        refreshPage();
    };

    //Handle click to open modal
    const handleOpenModal = () => {
        if (propertyModalRef.current) {
            propertyModalRef.current.showModal();
        }
    };

    // Handles pagination: Moves to the next page when clicked
    const handlePageChange = (selectedPage) => {
        if (selectedPage !== pageState.currentPage) {
            setPageState((prevState) => ({
                ...prevState,
                currentPage: selectedPage,
            }));
        }
    };

    //Handle click the price list item
    const handlePriceListItemClick = async (priceListItem) => {
        const id = priceListItem.price_list_master_id;
        const priceListData = {
            data: priceListItem,
        };

        navigate(`/property-pricing/basic-pricing/${id}`, {
            state: {
                priceListData: priceListData,
                action: null,
            },
        });
    };

    //handle cancel click if the price list item status is 'Draft'
    const handleStatusClick = async (event, priceListItem, action) => {
        event.stopPropagation();
        const id = priceListItem.price_list_master_id;
        const priceListData = { data: priceListItem };

        if (action !== "Cancel") {
            navigate(
                `/property-pricing/basic-pricing/${priceListItem.price_list_master_id}`,
                {
                    state: { priceListData: priceListData, action },
                }
            );
            return;
        }

        try {
            const response =
                await priceListMasterService.updatePriceListMasterStatus(
                    id
                    // Replace with the actual status you want to set
                );
            if (response.status === 200) {
                showToast(response?.data?.message, "success");
                await fetchPropertyListMasters(true, true);
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    //Toggle filter box
    const toggleFilterBox = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const isButtonDisabled = (searchFilters) => {
        const allEmpty =
            !searchFilters.property &&
            !searchFilters.paymentScheme &&
            !searchFilters.status &&
            !searchFilters.date;

        return allEmpty;
    };

    return (
        <div className="h-screen max-w-[1800px] bg-custom-grayFA px-4">
            <div className="">
                <button
                    onClick={handleOpenModal}
                    className="montserrat-semibold text-sm px-2 gradient-btn w-[214px] h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                >
                    Add Property and Pricing
                </button>
            </div>
            <div className="relative flex justify-start gap-3 mt-3  ">
                <div className="relative w-[582px]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4 absolute left-3 top-3 text-gray-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>
                    <input
                        type="text"
                        readOnly={true}
                        onClick={toggleFilterBox}
                        className="h-10 w-full rounded-lg pl-9 pr-6 text-sm border"
                        placeholder="Search"
                    />
                    <svg
                        onClick={toggleFilterBox}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-[24px] absolute right-3 top-2 text-custom-bluegreen hover:size-[26px]"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                        />
                    </svg>
                </div>
                <div className="ml-4 flex justify-center items-center">
                    <CustomToolTip text="Refresh page" position="top">
                        <button
                            className="  hover:bg-custom-grayF1 rounded-full text-custom-bluegreen hover:text-custom-lightblue"
                            onClick={handleRefreshPage}
                        >
                            <MdRefresh className="h-6 w-6 mt-1" />
                        </button>
                    </CustomToolTip>
                </div>

                {isFilterVisible && (
                    <div
                        className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[582px]"
                        ref={dropdownRef}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Property
                                </label>
                                <CustomInput
                                    type="text"
                                    name="property"
                                    value={searchFilters.property || ""}
                                    className="w-full  border-b-1 outline-none ml-2"
                                    onChange={onInputChange}
                                />
                            </div>
                            <div className="flex">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Payment Scheme
                                </label>
                                <CustomInput
                                    type="text"
                                    name="paymentScheme"
                                    value={searchFilters.paymentScheme || ""}
                                    className="w-full  border-b-1 outline-none ml-2"
                                    onChange={onInputChange}
                                />
                            </div>
                            {/* <div className="flex">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Promo
                                </label>
                                <CustomInput
                                    type="text"
                                    name="promo"
                                    value={searchFilters.promo || ""}
                                    className="w-full  border-b-1 outline-none ml-2"
                                    onChange={onInputChange}
                                />
                            </div> */}
                            <div className="flex gap-3">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    Date
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={
                                            searchFilters.date
                                                ? searchFilters.date
                                                : null
                                        }
                                        onChange={(date) =>
                                            handleDateChange(date)
                                        }
                                        className=" border-b-1 outline-none w-[176px]"
                                        calendarClassName="custom-calendar"
                                    />

                                    <img
                                        src={DateLogo}
                                        alt="date"
                                        className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6"
                                    />
                                </div>
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Status
                                </label>
                                <select
                                    className="w-full border-b-1 outline-none px-[5px]"
                                    name="status"
                                    value={searchFilters.status || ""}
                                    onChange={onInputChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="On-going Approval">
                                        On-going Approval
                                    </option>
                                    <option value="Approved not Live">
                                        Approved not Live
                                    </option>
                                    <option value="Approved and Live">
                                        Approved and Live
                                    </option>
                                </select>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button
                                    disabled={isButtonDisabled(searchFilters)}
                                    className={`h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm ${
                                        isButtonDisabled(searchFilters)
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                    }`}
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-3 ">
                <CustomTable
                    className="flex gap-4 items-center h-[49px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] mb-4 -mx-1 px-4"
                    isLoading={isLoading && isFirstLoad}
                    columns={COLUMNS}
                    data={priceListMaster}
                    renderRow={(item) => (
                        <PricelistMasterRow
                            key={item.price_list_master_id}
                            item={item}
                            handlePriceListItemClick={handlePriceListItemClick}
                            handleStatusClick={handleStatusClick}
                            toggled={toggled}
                            setToggled={setToggled}
                        />
                    )}
                />
            </div>
            <div className="flex w-full justify-start py-5">
                <Pagination
                    pageCount={pageState.pagination?.last_page || 1}
                    currentPage={pageState.currentPage || 1}
                    onPageChange={handlePageChange}
                />
            </div>
            <div>
                <AddPropertyModal
                    fetchData={fetchData}
                    propertyModalRef={propertyModalRef}
                />
            </div>
        </div>
    );
};

export default PricingMasterList;
