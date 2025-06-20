import React from "react";
import WalkinPage from "@/component/layout/inquirypage/WalkinPage";
import { Outlet } from "react-router-dom";
import WalkinTransactionHistoryPage from "@/component/layout/inquirypage/WalkinTransactionHistoryPage";
const WalkinView = () => {
    return (
        <div>
            <WalkinPage />
            <WalkinTransactionHistoryPage />
            <Outlet />
        </div>
    );
};

export default WalkinView;
