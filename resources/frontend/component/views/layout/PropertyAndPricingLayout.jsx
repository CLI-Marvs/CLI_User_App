import React from "react";
import { Outlet } from "react-router-dom";
import PropertyAndPricingSidebar from "../../layout/mainComponent/sidebars/PropertyAndPricingSidebar";

const PropertyAndPricingLayout = () => {
    return (
        <div className="flex bg-white relative h-full ">
            <div className="fixed h-full z-50">
                <PropertyAndPricingSidebar />
            </div>
            <div className="flex-1 ml-[230px] bg-custom-grayFA relative z-10">
                <Outlet />
            </div>
        </div>
    );
};

export default PropertyAndPricingLayout;
