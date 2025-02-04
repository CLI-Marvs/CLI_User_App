import { PriceListMasterProvider } from '@/context/PropertyPricing/PriceListMasterContext';
import { PaymentSchemeProvider } from '@/context/PropertyPricing/PaymentSchemeContext';
import { UnitProvider } from '@/context/PropertyPricing/UnitContext';
/**
 * This is the main provider for the property pricing context.
 * It wraps the PriceListMasterProvider and PaymentSchemeProvider.
 */
export const PropertyPricingProvider = ({ children }) => {
    return (
        <PriceListMasterProvider>
            <PaymentSchemeProvider>
                <UnitProvider>
                    {children}
                </UnitProvider>
            </PaymentSchemeProvider>
        </PriceListMasterProvider>
    );
};