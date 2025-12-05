import React from "react";
import { Link } from "react-router-dom";

const TransactionSidebar = () => {
    return (
        <div className="flex flex-col gap-5">
            <Link to="/transaction/invoices">
                <button className="w-full bg-custom-lightgreen text-white rounded-lg py-3 px-5">
                    AR Invoices
                </button>
            </Link>
            <Link to="/transaction/bankstatements">
                <button className="w-full bg-custom-lightgreen text-white rounded-lg py-3 px-5">
                    Transaction Records
                </button>
            </Link>
        </div>
    );
};

export default TransactionSidebar;
