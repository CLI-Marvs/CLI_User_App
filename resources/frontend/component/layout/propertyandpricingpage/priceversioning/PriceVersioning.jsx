import React, { useState, useRef, useEffect } from "react";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import AddPriceVersionModal from "@/component/layout/propertyandpricingpage/priceversioning/AddPriceVersionModal";
import { usePriceVersion } from "@/context/PropertyPricing/PriceVersionContext";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import PriceVersionRow from "@/component/layout/propertyandpricingpage/component/TableRows/PriceVersionRow";

const COLUMNS = [
    { label: "Property", width: "w-[160px]" },
    { label: "Version", width: "w-[150px]" },
    { label: "Percent Increase", width: "w-[100px]" },
    { label: "No. of Allowed Buyers", width: "w-[150px]" },
    { label: "Expiry Date", width: "w-[100px]" },
];
const PriceVersioning = () => {
    //States
    const [startDate, setStartDate] = useState(new Date());
    const dropdownRef = useRef(null);
    const [toggled, setToggled] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const modalRef = useRef(null);
    const {
        data: priceVersion,
        isLoading,
        pageState,
        setPageState,
        fetchData,
        isFirstLoad,
    } = usePriceVersion();

    //Hooks
    useEffect(() => {
        if (priceVersion && priceVersion.length === 0) {
            fetchData();
        }
    }, []);

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
    const toggleFilterBox = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    //Handle open the Add Price Version modal
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
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
    return (
        <div className="h-screen max-w-[1800px] bg-custom-grayFA px-4">
            <div className="">
                <button
                    onClick={handleOpenModal}
                    className="montserrat-semibold text-sm px-2 gradient-btn w-[158px] h-[37px] rounded-[10px] text-white"
                >
                    Add Price Version
                </button>
            </div>
            <div className="relative flex justify-start gap-3 mt-[20px]">
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
                        readOnly
                        onClick={toggleFilterBox}
                        className="h-10 w-full rounded-lg pl-9 pr-6 text-sm"
                        placeholder="Search"
                    />
                    <svg
                        onClick={toggleFilterBox}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4 absolute right-3 top-3 text-custom-bluegreen hover:size-[17px]"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                        />
                    </svg>
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
                                <input
                                    type="text"
                                    className="w-full  border-b-1 outline-none"
                                />
                            </div>
                            <div className="flex">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Payment Scheme
                                </label>
                                <input
                                    type="text"
                                    className="w-full  border-b-1 outline-none"
                                />
                            </div>
                            <div className="flex">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    {" "}
                                    Promo
                                </label>
                                <input
                                    type="text"
                                    className="w-full  border-b-1 outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                    Date
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
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
                                <select className="w-full border-b-1 outline-none">
                                    <option value="">Select Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="ongoing">
                                        On-going approval
                                    </option>
                                    <option value="approvenotlive">
                                        Approved not Live
                                    </option>
                                    <option value="approveandlive">
                                        Approve and Live
                                    </option>
                                </select>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-3 overflow-y-hidden">
                <CustomTable
                    className="flex gap-4 items-center h-[49px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] mb-4 -mx-1 px-4"
                    isLoading={isLoading && isFirstLoad}
                    columns={COLUMNS}
                    data={priceVersion}
                    renderRow={(item) => (
                        <PriceVersionRow
                            key={item.property_masters_id}
                            item={item}
                        />
                    )}
                />
            </div>
            <div className="flex w-full justify-start mt-[20px] pb-[150px] bg-custom-grayFA">
                <Pagination
                    pageCount={pageState.pagination?.last_page || 1}
                    currentPage={pageState.currentPage || 1}
                    onPageChange={handlePageChange}
                />
            </div>
            <div>
                <AddPriceVersionModal
                    fetchData={fetchData}
                    modalRef={modalRef}
                />
            </div>
        </div>
    );
};

export default PriceVersioning;
