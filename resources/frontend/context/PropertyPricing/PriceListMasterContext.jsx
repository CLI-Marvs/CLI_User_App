import { createContext, useContext, useState, useEffect } from "react";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import _ from "lodash";
import usePaginatedFetch from "@/component/layout/propertyandpricingpage/hooks/usePaginatedFetch";
import { useStateContext } from "@/context/contextprovider";

const PropertyMasterContext = createContext();

export const defaultFilters = {
    property: "",
    paymentScheme: "",
    date: null,
    status: "",
};

export const PriceListMasterProvider = ({ children }) => {
    const { user } = useStateContext();
    const [priceListMasterId, setPriceListMasterId] = useState(null);
    const [searchFilters, setSearchFilters] = useState(defaultFilters);
    const [empId, setEmpId] = useState(null);

    //Fetch all price list master
    const {
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
    } = usePaginatedFetch(
        priceListMasterService.getPriceListMasters,
        defaultFilters
    );

    // useEffect(() => {
    //     if (user?.id) {
    //         console.log("user id", user.id);
    //         setEmpId(user.id);
    //     }
    // }, [user?.id]);

    // Fetch price lists for reviewers or approvers
    // const {
    //     data: reviewerOrApproverData,
    //     isLoading: isLoadingReviewerOrApprover,
    //     error: errorReviewerOrApprover,
    //     fetchData: fetchReviewerOrApproverData,
    // } = usePaginatedFetch(
    //     priceListMasterService.getPriceListsForReviewerOrApprover,
    //     defaultFilters,
    //     { empId }
    // );

    // // Set empId when user is available
    // useEffect(() => {
    //     if (user?.id) {
    //         setEmpId(user.id);
    //     }
    // }, [user]);

    // // Refetch data when empId updates
    // useEffect(() => {
    //     if (empId) {
    //         fetchReviewerOrApproverData(true,false); // Force fetch when empId is set
    //     }
    // }, [empId]);
 

    const value = {
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        searchFilters,
        setSearchFilters,
        applySearch,
        refreshPage,
        defaultFilters,
        priceListMasterId,
        setPriceListMasterId,
        // reviewerOrApproverData,
        setEmpId,
    };

    return (
        <PropertyMasterContext.Provider value={value}>
            {children}
        </PropertyMasterContext.Provider>
    );
};

export const usePriceListMaster = () => {
    const context = useContext(PropertyMasterContext);
    if (!context) {
        throw new Error(
            "usePriceListMaster must be used within a PropertyMasterProvider"
        );
    }
    return context;
};
