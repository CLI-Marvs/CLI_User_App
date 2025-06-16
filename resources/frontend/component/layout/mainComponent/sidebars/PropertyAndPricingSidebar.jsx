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
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";

const PropertyAndPricingSidebar = () => {
    //States
    const location = useLocation();
    const { pricingData } = usePricing();
    const { excelId } = useUnit();
    const shouldBlockNavigation =
        !!excelId &&
        Object.keys(pricingData?.floorPremiums).length > 0 &&
        pricingData?.additionalPremiums.length > 0 && // Ensure it exists and isn't empty
        pricingData.additionalPremiums.every(
            (additionalPrem) => Number(additionalPrem.premiumCost) === 0
        );

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
            showToast(
                "You have unsaved changes. Please save before switching page.",
                "warning"
            );
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
            <Card className="flex h-screen pt-3 rounded-[10px] bg-customnavbar  ">
                <List className="flex flex-col justify-center w-full">
                    <div className="px-5 leading-1">
                        <div className="flex flex-col space-y-1 mt-1">
                            {/* Master list */}
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

                            {/* Payment scheme */}
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

                            {/*Price versioning */}
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

                            {/*Promotional pricing */}
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

                            {/* Workflow notification */}
                            <Link to="workflow-notification">
                                <ListItem
                                    onClick={(e) =>
                                        handleNavigation(
                                            e,
                                            "/property-pricing/workflow-notification"
                                        )
                                    }
                                    className={`menu2 text-sm h-9 mb-1 flex justify-start pl-4 gap-2 rounded-full text-custom-solidgreen font-normal hover:font-semibold hover:bg-white  ${
                                        location.pathname ===
                                        "/property-pricing/workflow-notification"
                                            ? "text-custom-solidgreen font-semibold bg-white"
                                            : "text-custom-solidgreen"
                                    }`}
                                >
                                    Workflow Notification
                                    <ListItemSuffix>
                                        <Chip
                                            value={1}
                                            size="sm"
                                            variant="ghost"
                                            color="blue-gray"
                                            className="rounded-md gradient-btn2 text-white"
                                        />
                                    </ListItemSuffix>
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
