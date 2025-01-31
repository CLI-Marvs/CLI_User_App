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
 
        return formattedPriceListSettings;
    },

    formatPriceVersionsPayload: (priceVersions = []) => {
        const formattedPriceVersions = priceVersions.map((priceVersion) => {
            const formattedPriceVersion = {
                version_id: priceVersion.id || 0,
                name: priceVersion.name,
                status: priceVersion.status,
                percent_increase: parseInt(priceVersion.percent_increase) || 0,
                no_of_allowed_buyers:
                    parseInt(priceVersion.no_of_allowed_buyers) || 0,
                expiry_date: priceVersion.expiry_date,
                payment_scheme: priceVersion.payment_scheme,
            };
            return formattedPriceVersion;
        });
        console.log("formatter", formattedPriceVersions);

        return formattedPriceVersions;
    },
    // formatPaymentSchemePayload: (paymentScheme) => {
    //     const formattedPaymentScheme = {
    //         payment_scheme_name: paymentScheme.paymentSchemeName,
    //         description: paymentScheme.description,
    //         spot: paymentScheme.spot,
    //         downpayment_installment: paymentScheme.downpaymentInstallment,
    //         number_months_downpayment: paymentScheme.numberMonthsDownpayment,
    //         discount: paymentScheme.discount,
    //         bank_financing: paymentScheme.bankFinancing,
    //         status: paymentScheme.status,
    //     };

    //     return formattedPaymentScheme;
    // },
};
