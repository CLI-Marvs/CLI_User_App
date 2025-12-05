import { PriceListMasterProvider } from "frontend/context/PropertyPricing/PriceListMasterContext";
import { PaymentSchemeProvider } from "frontend/context/PropertyPricing/PaymentSchemeContext";
import { UnitProvider } from "frontend/context/PropertyPricing/UnitContext";
import { PriceVersionProvider } from "frontend/context/PropertyPricing/PriceVersionContext";
import { PropertyProvider } from "frontend/context/PropertyPricing/PropertyContext";
import { BasicPricingProvider } from "frontend/component/layout/propertyandpricingpage/context/BasicPricingContext";
/**
 * This is the main provider for the property pricing context.
 * It wraps the PriceListMasterProvider and PaymentSchemeProvider.
 */
export const PropertyPricingProvider = ({ children }) => {
    return (
        <BasicPricingProvider>
            <PropertyProvider>
                <PriceListMasterProvider>
                    <PaymentSchemeProvider>
                        <UnitProvider>
                            <PriceVersionProvider>
                                {children}
                            </PriceVersionProvider>
                        </UnitProvider>
                    </PaymentSchemeProvider>
                </PriceListMasterProvider>
            </PropertyProvider>
        </BasicPricingProvider>
    );
};
