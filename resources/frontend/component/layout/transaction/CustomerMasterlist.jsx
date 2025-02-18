import React, { useEffect, useState } from "react";
import SearchTransactions from "@/component/layout/transaction/SearchBar";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "@/context/contextprovider";
import { data } from "@/component/servicesApi/apiCalls/transactions/customer";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const CustomerMasterlist = () => {
    const {
        customerData,
        setCustomerData,
        currentPageCustomer,
        setCurrentPageCustomer,
        totalPagesCustomer,
        setTotalPagesCustomer,
    } = useStateContext();

    const navigate = useNavigate();
    const navigateToDetails = (e, item) => {
        e.preventDefault();
        const emailAsNumber = btoa(item.buyer_email);
        navigate(`/sales/details/${emailAsNumber}`);
    };

    const handlePageClick = (data) => {
        setCurrentPageCustomer(data.selected);
    };

    const fetchDataCustomer = async () => {
        const response = await data.getCustomerData(currentPageCustomer);
        setCustomerData(response.data);
        setTotalPagesCustomer(response.last_page);
        setCurrentPageCustomer(currentPageCustomer);
    };
    useEffect(() => {
        fetchDataCustomer();
    }, [currentPageCustomer]);

    return (
        <div className="flex flex-col w-auto h-auto p-[20px] customer-scrollbar">
            <SearchTransactions />
            <div className="mt-[31px] z-0 w-full">
                <div className="overflow-x-auto px-3">
                    <table className="border-separate border-spacing-y-2 w-full min-w-max">
                        <thead>
                            <tr className="text-white bg-custom-lightgreen">
                                {[
                                    "Customer",
                                    "Properties",
                                    "Unresolved Inquiries",
                                    "Recent Transactions",
                                ].map((header, index) => (
                                    <th
                                        key={index}
                                        className="border-r-[1px] border-[#B9B7B7] px-[10px] py-[16px] text-[10px] shadow-custom12"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="montserrat-regular">
                            {customerData &&
                                customerData.map((item, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            className="h-[124px] cursor-pointer border-r-[1px] border-opacity-10 border-[#B9B7B7] shadow-custom11"
                                            onClick={(e) =>
                                                navigateToDetails(e, item)
                                            }
                                        >
                                            <td
                                                className={`px-[10px] cursor-pointer w-[208px] text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7] relative`}
                                            >
                                                <div className="absolute flex flex-col top-2">
                                                    <span className="">
                                                        Ms. Helen E. Bautista
                                                    </span>
                                                    <span className="">
                                                        BPN: 1000010232
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="cursor-pointer text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7] w-[533px] relative">
                                            <div className="w-full flex justify-between px-3">
                                                    <div className="flex flex-col">
                                                        <span>Test1</span>
                                                        <span>Test2</span>
                                                    </div>
                                                    <span>Test3</span>
                                                </div>
                                                <div className="w-full flex justify-between px-3">
                                                    <div className="flex flex-col">
                                                        <span>Test1</span>
                                                        <span>Test2</span>
                                                    </div>
                                                    <span>Test3</span>
                                                </div>
                                                <div className="w-full flex justify-between px-3">
                                                    <div className="flex flex-col">
                                                        <span>Test1</span>
                                                        <span>Test2</span>
                                                    </div>
                                                    <span>Test3</span>
                                                </div>
                                                <div className="w-full flex justify-between px-3">
                                                    <div className="flex flex-col">
                                                        <span>Test1</span>
                                                        <span>Test2</span>
                                                    </div>
                                                    <span>Test3</span>
                                                </div>
                                            </td>

                                            <td
                                                className={`py-[16px] px-[10px] cursor-pointer text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7] w-[533px]`}
                                            >
                                                {/* {item.ticket_id} */}
                                            </td>
                                            <td
                                                className={`py-[16px] px-[10px] cursor-pointer text-xs w-[670px]`}
                                            >
                                                {/* {item.ticket_id} */}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <ReactPaginate
                            previousLabel={
                                <MdKeyboardArrowLeft className="text-[#404B52]" />
                            }
                            nextLabel={
                                <MdKeyboardArrowRight className="text-[#404B52]" />
                            }
                            breakLabel={"..."}
                            pageCount={totalPagesCustomer}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            containerClassName={"flex gap-2"}
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName={
                                "text-gray-300 cursor-not-allowed"
                            }
                            forcePage={currentPageCustomer}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerMasterlist;
