import { PriceListMasterProvider } from '@/context/PropertyPricing/PriceListMasterContext';
import { PaymentSchemeProvider } from '@/context/PropertyPricing/PaymentSchemeContext';
/**
 * This is the main provider for the property pricing context.
 * It wraps the PriceListMasterProvider and PaymentSchemeProvider.
 */
export const PropertyPricingProvider = ({ children }) => {
    return (
        <PriceListMasterProvider>
            <PaymentSchemeProvider>
                {children}
            </PaymentSchemeProvider>
        </PriceListMasterProvider>
    );
};