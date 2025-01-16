import React from "react";
import BasicPricing from "../../../layout/propertyandpricingpage/basicpricing/BasicPricing";
import BasicPricingProvider from '@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext';
const BasicPricingView = () => {

    return (
        <div className="bg-custom-grayFA">
            <BasicPricingProvider>
                <BasicPricing />
            </BasicPricingProvider>
        </div>
    );
};

export default BasicPricingView;
