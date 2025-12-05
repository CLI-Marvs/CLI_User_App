import React from "react";
import WalkinListPage from "frontend/component/layout/inquirypage/WalkinListPage";
import { Outlet, useLocation } from "react-router-dom";
import WalkinTransactionHistoryPage from "frontend/component/layout/inquirypage/WalkinTransactionHistoryPage";
const WalkinView = () => {
    const location = useLocation();
    const isHistoryPage = location.pathname.includes('/walk-in/history');

    return (
        <div>
            {!isHistoryPage && <WalkinListPage />}
            <Outlet />
        </div>
    );
};

export default WalkinView;
