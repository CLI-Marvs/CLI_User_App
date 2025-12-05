import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ReportPage from "../../../layout/inquirypage/ReportPage";

const ReportViews = () => {
    const location = useLocation();
    const isWalkInRoute = location.pathname.includes("/walk-in");

    return (
        <div className="h-screen overflow-auto">
            {!isWalkInRoute && <ReportPage />}
            <Outlet />
        </div>
    );
};

export default ReportViews;
