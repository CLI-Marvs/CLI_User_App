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
            <div className="mt-[31px]">
                <table className="border-collapse">
                    <thead>
                        <tr className="text-white bg-custom-lightgreen">
                            {[
                                "Company Code",
                                "Properties",
                                "Contract Number",
                                "Business Partner",
                                "Full Name",
                                "Partner Category",
                            ].map((header, index) => (
                                <th
                                    key={index}
                                    className="border-r-[1px] border-[#B9B7B7] px-[10px] py-[16px] text-xs"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="montserrat-regular">
                        {customerData &&
                            customerData.map((item, index) => {
                                const rowClass =
                                    index > 0 && index % 2 === 0
                                        ? "bg-[#EAEAEA]"
                                        : "";
                                return (
                                    <tr
                                        key={index}
                                        className={rowClass}
                                        onClick={(e) =>
                                            navigateToDetails(e, item)
                                        }
                                    >
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {item.ticket_id}
                                        </td>
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {/* {item.ticket_id} */}
                                        </td>
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {/*  {item.ticket_id} */}
                                        </td>
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {/*    {item.ticket_id} */}
                                        </td>
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {item.buyer_name}
                                        </td>
                                        <td
                                            className={`py-[16px] px-[10px] cursor-pointer text-xs ${rowClass}`}
                                        >
                                            {/*   {item.ticket_id} */}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
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
                            pageClassName=" border border-[#EEEEEE] bg- text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
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
