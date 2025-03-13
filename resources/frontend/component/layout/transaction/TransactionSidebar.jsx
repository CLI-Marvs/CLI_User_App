import React from "react";
import { Link, useLocation } from "react-router-dom";

const TransactionSidebar = () => {
    const location = useLocation();
    const { pathname } = location;

    const receivablesMenu = [
        { name: "Invoices", path: "/transaction/receivables/invoices" },
        { name: "Transactions", path: "/transaction/receivables/transactions" },
        { name: "Auto Posting", path: "/transaction/receivables/posting" },
     /*    { name: "Reports", path: "/transaction/receivables/reports" }, */
    ];

    return (
        <>
            {pathname === "/transaction/bank-monitoring/bank-statements" ? (
                <div className="bg-custom-grayFA">
                    <div className="group flex h-full px-3 py-5 rounded-[10px] bg-[#EFEFEF] transition-all duration-300 w-[189px] space-y-3 cursor-pointer">
                        <div className="flex flex-col w-full">
                            <div className="bg-white shadow-custom12 rounded-xl flex items-center justify-center px-[18px] py-[8px]">
                                <span className="text-base font-semibold">
                                    Bank Statements
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-custom-grayFA">
                    <div className="group px-3 py-5 rounded-[10px] bg-[#EFEFEF] transition-all duration-300 w-[189px] h-full space-y-3">
                        {receivablesMenu.map((item, index) => (
                            <Link to={item.path} key={index}>
                                <div
                                    className={`flex items-center justify-center px-[18px] py-[8px] cursor-pointer ${
                                        pathname === item.path ? "bg-white shadow-custom12 rounded-xl" : ""
                                    }`}
                                >
                                    <span
                                        className={`text-base font-semibold ${
                                            pathname === item.path ? "text-black" : "text-[#8A8888]"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default TransactionSidebar;
