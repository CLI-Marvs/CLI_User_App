import React, { useEffect, useRef } from "react";
import AddPaymentSchemeModal from "./AddPaymentSchemeModal";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import PaymentSchemeRow from "@/component/layout/propertyandpricingpage/component/TableRows/PaymentSchemeRow";

const COLUMNS = [
    { label: "Status", width: "w-[100px]" },
    { label: "Payment Scheme", width: "w-[150px]" },
    { label: "Description", width: "w-[200px]" },
    { label: "Spot", width: "w-[100px]" },
    { label: "Installment/No. Months", width: "w-[100px]" },
    { label: "Bank Fianancing", width: "w-[100px]" },
    { label: "Discount", width: "w-[120px]" },
];

const PaymentScheme = () => {
    //State
    const modalRef = useRef(null);
    const {
        data: paymentScheme,
        isLoading,
        fetchData,
        pageState,
        setPageState,
        isFirstLoad,
    } = usePaymentScheme();

    //Hooks
    useEffect(() => {
        fetchData(true, false);
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

            <div className="mt-3  ">
                <CustomTable
                    className="flex gap-[30px] items-center h-[49px] montserrat-semibold text-sm text-[#A5A5A5] bg-white rounded-[10px] mb-4 -mx-1 px-4"
                    isLoading={isLoading && isFirstLoad}
                    columns={COLUMNS}
                    data={paymentScheme}
                    renderRow={(item) => (
                        <PaymentSchemeRow item={item} key={item.id} />
                    )}
                />
            </div>
            <div className="flex w-full justify-start mt-3 py-5">
                <Pagination
                    pageCount={pageState.pagination?.last_page || 1}
                    currentPage={pageState.currentPage || 1}
                    onPageChange={handlePageChange}
                />
            </div>
            <div>
                <AddPaymentSchemeModal
                    fetchData={fetchData}
                    modalRef={modalRef}
                />
            </div>
        </div>
    );
};

export default PaymentScheme;
