import React from "react";
import { Link } from "react-router-dom";

const TransactionSidebar = () => {
    return (
        <div className="bg-custom-lightestgreen p-5 w-[200px] mr-10">
          <div className="flex flex-col gap-5">
          <Link to="/transaction/invoices">
                <button className="w-full bg-custom-lightgreen text-white rounded-lg py-3 px-5">
                    AR Invoices
                </button>
            </Link>
            <Link to="/transaction/bankstatements">
                <button className="w-full bg-custom-lightgreen text-white rounded-lg py-3 px-5">
                    Bank Statements
                </button>
            </Link>
          </div>
        </div>
    );
};

export default TransactionSidebar;
