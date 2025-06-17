import React, { useEffect } from "react";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { useStateContext } from "@/context/contextprovider";

const WorkFlowNotification = () => {
    //States
    const { user } = useStateContext();
    const {
        data: priceListMaster,
        isLoading,
        pageState,
        setPageState,
        fetchData: fetchReviewerOrApproverData,
        isFirstLoad,
        searchFilters,
        setSearchFilters,
        applySearch,
        refreshPage,
        defaultFilters,
        setEmpId,
        empId,
    } = usePriceListMaster();


    return (
        <div className="h-screen max-w-[1800px] bg-custom-grayFA px-10">
            <div
                className={`flex items-center min-h-[47px] cursor-pointer my-1 
            hover:shadow-custom4  justify-between px-2 `}
            >
                {/* <div>
                    <h6 className="montserrat-medium">Property name</h6>
                </div>
                <div>
                    <label className="montserrat-regular">Status</label>
                </div> */}
            </div>
        </div>
    );
};

export default WorkFlowNotification;
