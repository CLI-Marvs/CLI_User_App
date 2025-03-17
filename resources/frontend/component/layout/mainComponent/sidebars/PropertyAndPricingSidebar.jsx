import React, { useState, useEffect } from "react";
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";

const PropertyAndPricingSidebar = () => {
    //States
    const location = useLocation();
    const { pricingData } = usePricing();
    const { excelId } = useUnit();
    const shouldBlockNavigation =
        !!excelId && Object.keys(pricingData?.floorPremiums).length > 0;

    // Check if all premiumCost values are empty
    const allEmptyFloorPremium =
        shouldBlockNavigation &&
        pricingData?.floorPremiums &&
        Object.keys(pricingData.floorPremiums).length > 0 &&
        Object.values(pricingData.floorPremiums).every(
            (floorPremium) => Number(floorPremium?.premiumCost) === 0
        );
    const allEmptyAdditionalPremium =
        shouldBlockNavigation &&
        pricingData.additionalPremiums.length > 0 &&
        pricingData.additionalPremiums.every(
            (additionalPrem) =>
                Number(additionalPrem.premiumCost) === 0 ||
                additionalPrem.viewName === ""
        );

    // Handle navigation blocking
    const handleNavigation = (event) => {
        if (allEmptyFloorPremium && allEmptyAdditionalPremium) {
            event.preventDefault();
            showToast("Please save before moving to another tab.", "warning");
        }
    };

    // Attach event listener for navigation
    useEffect(() => {
        window.addEventListener("beforeunload", handleNavigation);
        return () => {
            window.removeEventListener("beforeunload", handleNavigation);
        };
    }, [
        allEmptyFloorPremium,
        allEmptyAdditionalPremium,
        shouldBlockNavigation,
    ]);

    return (
        <>
            <Card className="flex w-[230px] h-screen pt-3 rounded-[10px] bg-customnavbar">
                <List className="flex flex-col justify-center w-full">
                    <div className="px-5 leading-1">
                        <div className="flex flex-col space-y-1 mt-1">
                            <Link to="master-lists">
                                <ListItem
                                    onClick={(e) =>
                                        handleNavigation(
                                            e,
                                            "/property-pricing/master-lists"
                                        )
                                    }
                                    className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full text-custom-solidgreen font-normal hover:font-semibold hover:bg-white ${
                                        location.pathname ===
                                        "/property-pricing/master-lists"
                                            ? "text-custom-solidgreen font-semibold bg-white"
                                            : "text-custom-solidgreen"
                                    }`}
                                >
                                    Price List
                                </ListItem>
                            </Link>
                            <Link to="payment-scheme">
                                <ListItem
                                    onClick={(e) =>
                                        handleNavigation(
                                            e,
                                            "/property-pricing/payment-scheme"
                                        )
                                    }
                                    className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${
                                        location.pathname ===
                                        "/property-pricing/payment-scheme"
                                            ? "text-custom-solidgreen font-semibold bg-white"
                                            : "text-custom-solidgreen"
                                    }`}
                                >
                                    Payment Scheme
                                </ListItem>
                            </Link>
                            <Link to="price-versioning">
                                <ListItem
                                    onClick={(e) =>
                                        handleNavigation(
                                            e,
                                            "/property-pricing/price-versioning"
                                        )
                                    }
                                    className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${
                                        location.pathname ===
                                        "/property-pricing/price-versioning"
                                            ? "text-custom-solidgreen font-semibold bg-white"
                                            : "text-custom-solidgreen"
                                    }`}
                                >
                                    Price Versioning
                                </ListItem>
                            </Link>
                            <Link to="promotional-pricing">
                                <ListItem
                                    onClick={(e) =>
                                        handleNavigation(
                                            e,
                                            "/property-pricing/promotional-pricing"
                                        )
                                    }
                                    className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${
                                        location.pathname ===
                                        "/property-pricing/promotional-pricing"
                                            ? "text-custom-solidgreen font-semibold bg-white"
                                            : "text-custom-solidgreen"
                                    }`}
                                >
                                    Promotional Pricing
                                </ListItem>
                            </Link>
                        </div>
                    </div>
                </List>
            </Card>
        </>
    );
};

export default PropertyAndPricingSidebar;
