//This utilities function is used to format the price list settings data
export const formatPriceListSettingsPayload = (priceListSettings) => {
    const formattedPriceListSettings = {
        base_price: parseInt(priceListSettings.basePrice) || 0,
        transfer_charge: parseInt(priceListSettings.transferCharge) || 0,
        effective_balcony_base:
            parseInt(priceListSettings.effectiveBalconyBase) || 0,
        vat: parseInt(priceListSettings.vat) || 0,
        vatable_less_price: parseInt(priceListSettings.vatableListPrice) || 0,
        reservation_fee: parseInt(priceListSettings.reservationFee) || 0,
    };
    return formattedPriceListSettings;
};
