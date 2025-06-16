import { PriceListMasterProvider } from "@/context/PropertyPricing/PriceListMasterContext";
import { PaymentSchemeProvider } from "@/context/PropertyPricing/PaymentSchemeContext";
import { UnitProvider } from "@/context/PropertyPricing/UnitContext";
import { PriceVersionProvider } from "@/context/PropertyPricing/PriceVersionContext";
import { PropertyProvider } from "@/context/PropertyPricing/PropertyContext";
import { BasicPricingProvider } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
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
