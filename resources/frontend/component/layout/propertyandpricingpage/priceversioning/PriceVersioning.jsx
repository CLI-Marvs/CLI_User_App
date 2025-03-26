import React, { useState, useRef, useEffect } from "react";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import AddPriceVersionModal from "@/component/layout/propertyandpricingpage/priceversioning/AddPriceVersionModal";
import { usePriceVersion } from "@/context/PropertyPricing/PriceVersionContext";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import PriceVersionRow from "@/component/layout/propertyandpricingpage/component/TableRows/PriceVersionRow";
import CustomSearchInput from "@/component/layout/propertyandpricingpage/component/CustomSearchInput";
import CustomSearchFilter from "@/component/layout/propertyandpricingpage/component/CustomSearchFilter";
import CustomInput from "@/component/Input/CustomInput";
import moment from "moment";

const COLUMNS = [
    { label: "Property", width: "w-[160px]" },
    { label: "Version", width: "w-[150px]" },
    { label: "Percent Increase", width: "w-[100px]" },
    { label: "No. of Allowed Buyers", width: "w-[150px]" },
    { label: "Expiry Date", width: "w-[100px]" },
];
const PriceVersioning = () => {
    //States
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
        applySearch,
        isFirstLoad,
        searchFilters,
        setSearchFilters,
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

    //Handle search filter input change
    const onInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleSearch = async () => {
        applySearch(searchFilters);
    };

    //Handle search filter date change
    const handleDateChange = (date) => {
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            date: date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : null,
        }));
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
        <div className="h-screen max-w-[1800px] bg-custom-grayFA px-10">
            <div className="">
                <button
                    onClick={handleOpenModal}
                    className="montserrat-semibold text-sm px-2 gradient-btn w-[158px] h-[37px] rounded-[10px] text-white"
                >
                    Add Price Version
                </button>
            </div>
            {/* <div className="relative flex justify-start gap-3 mt-[20px]">
                <CustomSearchInput
                    placeholder="Search"
                    onToggleFilter={toggleFilterBox}
                />
                <CustomSearchFilter
                    ref={dropdownRef}
                    isFilterVisible={isFilterVisible}
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

                        <div className="flex gap-3">
                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[85px] ">
                                Date
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        searchFilters.date
                                            ? searchFilters.date
                                            : null
                                    }
                                    onChange={(date) => handleDateChange(date)}
                                    className=" border-b-1 outline-none w-[176px]"
                                    calendarClassName="custom-calendar"
                                />

                                <img
                                    src={DateLogo}
                                    alt="date"
                                    className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6"
                                />
                            </div>
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
                </CustomSearchFilter>
            </div> */}
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
