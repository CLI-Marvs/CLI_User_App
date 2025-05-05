import React from "react";
import { Link, useLocation } from "react-router-dom";

const TransactionSidebar = () => {
    const { pathname } = useLocation();

    const menuMap = {
        "/transaction/receivables": [
            { name: "Transactions", path: "/transaction/receivables/transactions" },
            { name: "Invoices", path: "/transaction/receivables/invoices" },
            { name: "Auto Posting", path: "/transaction/receivables/posting" },
        ],
        "/transaction/bank-monitoring": [
            { name: "Bank Statements", path: "/transaction/bank-monitoring/bank-statements" },
        ],
        "/transaction/settings": [
            { name: "Markup Settings", path: "/transaction/settings/markup" },
        ],
    };


    const basePath = Object.keys(menuMap).find(key => pathname.startsWith(key));
    const currentMenu = basePath ? menuMap[basePath] : [];

    return (
        <div className="bg-custom-grayFA">
            <div className="group px-3 py-5 rounded-[10px] bg-[#EFEFEF] transition-all duration-300 w-[189px] h-full space-y-3">
                {currentMenu.map(({ name, path }) => {
                    const isActive = pathname === path;
                    return (
                        <Link to={path} key={path}>
                            <div
                                className={`flex items-center justify-center px-[18px] py-[8px] cursor-pointer ${
                                    isActive ? "bg-white shadow-custom12 rounded-xl" : ""
                                }`}
                            >
                                <span
                                    className={`text-base font-semibold ${
                                        isActive ? "text-black" : "text-[#8A8888]"
                                    }`}
                                >
                                    {name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionSidebar;
