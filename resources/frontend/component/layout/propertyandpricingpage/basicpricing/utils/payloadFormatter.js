export const formatPayload = {
    formatPriceListSettingsPayload: (priceListSettings = {}) => {
        const formattedPriceListSettings = {
            base_price: parseInt(priceListSettings.base_price) || 0,
            transfer_charge: parseInt(priceListSettings.transfer_charge) || 0,
            effective_balcony_base:
                parseInt(priceListSettings.effective_balcony_base) || 0,
            vat: parseInt(priceListSettings.vat) || 0,
            vatable_less_price:
                parseInt(priceListSettings.vatable_less_price) || 0,
            reservation_fee: parseInt(priceListSettings.reservation_fee) || 0,
        };
        console.log("formattedPriceListSettings", formattedPriceListSettings);
        return formattedPriceListSettings;
    },
    formatPaymentSchemePayload: (paymentScheme) => {},
};
