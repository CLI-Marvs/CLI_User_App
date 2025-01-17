import React, { useEffect } from "react";
import SearchTransactions from "@/component/layout/transaction/SearchBar";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "@/context/contextprovider";
import { data } from "@/component/servicesApi/apiCalls/transactions/customer";

const CustomerMasterlist = () => {
    const { customerData, setCustomerData } = useStateContext();
    const navigate = useNavigate();
    const navigateToDetails = (e, item) => {
        e.preventDefault();
        const emailAsNumber = btoa(item.buyer_email);
        navigate(`/transaction/details/${emailAsNumber}`);
    };

    const fetchDataCustomer = async () => {
        const response = await data.getCustomerData();
        setCustomerData(response.data);
    };
    useEffect(() => {
        fetchDataCustomer();
    }, []);

    return (
        <div className="w-auto h-auto p-[20px] customer-scrollbar">
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
                                        onClick={(e) => navigateToDetails(e, item)}
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
            </div>
        </div>
    );
};

export default CustomerMasterlist;
