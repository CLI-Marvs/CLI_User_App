import React from "react";
import WalkinPage from "@/component/layout/inquirypage/WalkinPage";
import { Outlet, useLocation } from "react-router-dom";
import WalkinTransactionHistoryPage from "@/component/layout/inquirypage/WalkinTransactionHistoryPage";
const WalkinView = () => {
    const location = useLocation();
    const isHistoryPage = location.pathname.includes('/walk-in/history');

    return (
        <div>
            {!isHistoryPage && <WalkinPage />}
            <Outlet />
        </div>
    );
};

export default WalkinView;
