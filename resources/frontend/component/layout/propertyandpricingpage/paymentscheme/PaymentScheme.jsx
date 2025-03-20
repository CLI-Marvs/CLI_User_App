import React, { useEffect, useRef } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import AddPaymentSchemeModal from "./AddPaymentSchemeModal";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";
import moment from "moment";
import Skeleton from "@/component/Skeletons";

const PaymentScheme = () => {
    //State
    const modalRef = useRef(null);
    const {
        data: paymentScheme,
        isLoading,
        error,
        fetchData,
        pageState,
        setPageState,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
    } = usePaymentScheme();
    
 
    //Hooks
    useEffect(() => {
        fetchData(true,false);
    }, []);

    //Event handler
    //Handle open the Add Payment modal
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
                    className="montserrat-semibold text-sm px-2 gradient-btn2 w-[192px] h-[37px] rounded-[10px] text-white"
                >
                    Add Payment Scheme
                </button>
            </div>

            <div className="mt-3 overflow-y-hidden">
                <table className="overflow-x-auto bg-custom-grayFA mb-2 mx-1">
                    <thead>
                        <tr className="flex gap-[30px] items-center h-[49px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] mb-4 -mx-1 px-4">
                            <th className="flex justify-start w-[100px] shrink-0 pl-1">
                                Status
                            </th>
                            <th className="flex justify-start w-[150px] shrink-0 pl-1">
                                Payment Scheme
                            </th>
                            <th className="flex justify-start w-[200px] shrink-0 pl-1">
                                Description
                            </th>
                            <th className="flex justify-start w-[100px] shrink-0 pl-1">
                                Spot
                            </th>
                            <th className="flex justify-start w-[100px] shrink-0 pl-1">
                                Installment/No. Months
                            </th>
                            <th className="flex justify-start w-[100px] shrink-0 pl-1">
                                Bank Fianancing
                            </th>
                            <th className="flex justify-start w-[120px] shrink-0 pl-1">
                                Discount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="mt-{10px} rounded-[10px] shadow-md">
                        {isLoading ? (
                            <div>
                                <Skeleton height={140} />
                                <Skeleton height={140} />
                                <Skeleton height={140} />
                            </div>
                        ) : paymentScheme && paymentScheme.length > 0 ? (
                            paymentScheme.map((item, index) => (
                                <tr
                                    className="flex min-h-[68px] text-sm justify-start gap-[30px] px-[12px] even:bg-custombg3"
                                    key={index}
                                >
                                    <td
                                        className="flex flex-col justify-center w-[100px] pr-3 py-3"
                                        colSpan="100%"
                                    >
                                        <p className="font-bold text-custom-solidgreen">
                                            {item?.status}
                                        </p>
                                        <p>
                                            {moment(item.created_at).format(
                                                "M / D / YYYY"
                                            )}
                                        </p>
                                    </td>
                                    <td className="flex items-center w-[150px]">
                                        <p>{item?.payment_scheme_name}</p>
                                    </td>
                                    <td className="flex items-center w-[200px] pr-3 py-3">
                                        <p>{item?.description}</p>
                                    </td>
                                    <td className="flex items-center w-[100px]">
                                        <p>{item?.spot}%</p>
                                    </td>
                                    <td className="flex items-center w-[100px] space-x-1">
                                        <p>{item?.downpayment_installment}%</p>
                                        {item?.number_months_downpayment >
                                            0 && (
                                            <p>
                                                (
                                                {item.number_months_downpayment}{" "}
                                                mos)
                                            </p>
                                        )}
                                    </td>
                                    <td className="flex items-center w-[120px]">
                                        <p>
                                            {item?.bank_financing}% (100% LP -
                                            RF)
                                        </p>
                                    </td>
                                    <td className="flex items-center w-[120px]">
                                        <p>{item?.discount}%</p>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-3">
                                    No payment schemes available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex w-full justify-start mt-3 py-5">
                <Pagination
                    pageCount={pageState.pagination?.last_page || 1}
                    currentPage={pageState.currentPage || 1}
                    onPageChange={handlePageChange}
                />
            </div>
            <div>
                <AddPaymentSchemeModal fetchData={fetchData} modalRef={modalRef} />
            </div>
        </div>
    );
};

export default PaymentScheme;
