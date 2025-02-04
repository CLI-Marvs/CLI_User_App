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

        return formattedPriceVersions;
    },

    formatMultipleFloorPremiums: (floorPremiums = {}) => {
        const formattedFloorPremiums = Object.keys(floorPremiums).reduce(
            (acc, floorNumber) => {
                const floor = floorPremiums[floorNumber];
                const formattedFloor = {
                    id: floor.id,
                    floor: parseInt(floorNumber, 10), // Convert floor number to integer
                    premiumCost: parseInt(floor.premiumCost, 10) || 0, // Default to 0 if invalid
                    luckyNumber:
                        typeof floor.luckyNumber === "boolean"
                            ? floor.luckyNumber
                            : false, // Ensure boolean value
                    excludedUnits: Array.isArray(floor.excludedUnits)
                        ? floor.excludedUnits
                        : [], // Default to empty array if not an array
                };
                acc.push(formattedFloor);
                return acc;
            },
            []
        );

        console.log("Formatted Floor Premiums:", formattedFloorPremiums);
        return formattedFloorPremiums;
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
