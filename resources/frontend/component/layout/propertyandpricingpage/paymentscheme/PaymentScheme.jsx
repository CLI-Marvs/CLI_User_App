import React, { useEffect, useState, useRef } from "react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import AddPaymentSchemeModal from "./AddPaymentSchemeModal";

import moment from "moment";
import { paymentSchemeService } from '@/component/servicesApi/apiCalls/propertyPricing/paymentScheme/paymentSchemeService';

const PaymentScheme = () => {
    //State
    const modalRef = useRef(null);
    const [paymentSchemes, setPaymentSchemes] = useState([]);


    //Hooks
    useEffect(() => {
        fetchPaymentSchemes();
    }, []);


    //Event handler
    //Get all payment schemes
    const fetchPaymentSchemes = async () => {
        try {
            const response = await paymentSchemeService.getPaymentSchemes();
            setPaymentSchemes(response.data);
        } catch (error) {
            console.error("Error fetching payment schemes:", error);
        }
    };

    //Handle open the Add Payment modal
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
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
                                spot
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
                        {/* TODO: add skeleton here */}
                        {paymentSchemes &&
                            paymentSchemes.map((item, index) => (
                                <tr
                                    className="flex min-h-[68px]  text-sm justify-start gap-[30px] px-[12px] even:bg-custombg3"
                                    key={index}
                                >
                                    <td className="flex flex-col justify-center w-[100px] pr-3 py-3 " colSpan="100%">
                                        <p className="font-bold text-custom-solidgreen ">
                                            {item?.status}
                                        </p>
                                        <p>
                                            {moment(item.created_at).format(
                                                "M / D / YYYY"
                                            )}
                                        </p>
                                    </td>
                                    <td className="flex items-center w-[150px]">
                                        <p> {item?.payment_scheme_name}</p>
                                    </td>
                                    <td className="flex items-center w-[200px] pr-3 py-3">
                                        <p>{item?.description}</p>
                                    </td>
                                    <td className="flex items-center w-[100px]">
                                        <p>{item?.spot}%</p>
                                    </td>
                                    <td className="flex items-center w-[100px]  space-x-1">
                                        <p>{item?.downpayment_installment}%</p>
                                        {item?.number_months_downpayment >
                                            0 && (
                                                <p>
                                                    (
                                                    {item.number_months_downpayment}
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
                            ))}
                        {/* <tr className="flex min-h-[68px]  shadow-custom4 text-sm justify-start gap-[30px] px-[12px] bg-custom-grayFA">
                            <td className="flex flex-col justify-center w-[100px] pr-3 py-3">
                                <p className="font-bold text-custom-gray81 ">
                                    Draft
                                </p>
                                <p>3/3/2024</p>
                                <div className="">
                                    <p className="underline cursor-pointer text-blue-500">
                                        Edit
                                    </p>
                                </div>
                            </td>
                            <td className="flex items-center w-[150px]">
                                <p>Spot 12% DP</p>
                            </td>
                            <td className="flex items-center w-[200px] pr-3 py-3">
                                <p>
                                    Spot 12% DP on TCP with 5% Discount on LP
                                    (net of RF)
                                </p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>12%</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>0%</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>88%</p>
                            </td>
                            <td className="flex items-center w-[120px]">
                                <p>5% (100% LP - RF)</p>
                            </td>
                        </tr>
                        <tr className="flex min-h-[68px]  shadow-custom4 text-sm justify-start gap-[30px] px-[12px] bg-white">
                            <td className="flex flex-col justify-center w-[100px] pr-3 py-3">
                                <p className="font-bold text-[#5B9BD5]">
                                    On-going Approval
                                </p>
                                <p>3/3/2024</p>
                                <div className="">
                                    <p className="underline cursor-pointer text-blue-500">
                                        Cancel
                                    </p>
                                </div>
                            </td>
                            <td className="flex items-center w-[150px]">
                                <p>Spot 2% DP</p>
                            </td>
                            <td className="flex items-center w-[200px] pr-3 py-3">
                                <p>
                                    Spot 2% DP on TCP with 10% Discount on 2% LP
                                </p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>2%</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>10% (59 mos)</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>88%</p>
                            </td>
                            <td className="flex items-center w-[120px]">
                                <p>2% (2% LP)</p>
                            </td>
                        </tr>
                        <tr className="flex min-h-[68px] shadow-custom4 text-sm justify-start gap-[30px] px-[12px] bg-custom-grayFA  rounded-b-[10px]">
                            <td className="flex flex-col justify-center w-[100px] pr-3 py-3">
                                <p className="font-bold text-custom-solidgreen">
                                    Approved
                                </p>
                                <p>3/3/2024</p>
                            </td>
                            <td className="flex items-center w-[150px]">
                                <p>Installment</p>
                            </td>
                            <td className="flex items-center w-[200px] pr-3 py-3">
                                <p>12% DP with 10% Discount</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>2%</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>12% (60 mos)</p>
                            </td>
                            <td className="flex items-center w-[100px]">
                                <p>88%</p>
                            </td>
                            <td className="flex items-center w-[120px]">
                                <p>-</p>
                            </td>
                        </tr> */}
                    </tbody>
                </table>
            </div>
            <div className="flex w-full justify-start mt-3">
                <ReactPaginate
                    previousLabel={
                        <MdKeyboardArrowLeft className="text-[#404B52]" />
                    }
                    nextLabel={
                        <MdKeyboardArrowRight className="text-[#404B52]" />
                    }
                    breakLabel={"..."}
                    pageCount={2}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={1}
                    /* onPageChange={handlePageClick} */
                    containerClassName={"flex gap-2"}
                    previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                    nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                    pageClassName=" border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                    activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                    pageLinkClassName="w-full h-full flex justify-center items-center"
                    activeLinkClassName="w-full h-full flex justify-center items-center"
                    disabledLinkClassName={"text-gray-300 cursor-not-allowed"}
                /* forcePage={currentPage} */
                />
            </div>
            <div>
                <AddPaymentSchemeModal
                    onSubmitSuccess={fetchPaymentSchemes}
                    modalRef={modalRef}
                />
            </div>
        </div>
    );
};

export default PaymentScheme;
