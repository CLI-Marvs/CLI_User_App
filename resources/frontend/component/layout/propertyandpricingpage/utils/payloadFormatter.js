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
                expiry_date:
                    priceVersion.expiry_date === "N/A" ||
                    !priceVersion.expiry_date
                        ? null
                        : priceVersion.expiry_date,

                payment_scheme: priceVersion.payment_scheme,
                priority_number: priceVersion.priority_number,
            };
            return formattedPriceVersion;
        });

        return formattedPriceVersions;
    },

    formatSelectedAdditionalPremiumsPayload: (
        selectedAdditionalPremiums = []
    ) => {
        const formattedSelectedAdditionalPremiums =
            selectedAdditionalPremiums.map((premium) => {
                const formattedPremium = {
                    unit_id: premium.unit_id,
                    additional_premium_id: premium.additional_premium_id,
                };
                return formattedPremium;
            });
        return formattedSelectedAdditionalPremiums;
    },
    formatMultipleFloorPremiums: (floorPremiums = {}) => {
        const formattedFloorPremiums = Object.keys(floorPremiums).reduce(
            (acc, floorNumber) => {
                /* eslint-disable security/detect-object-injection */
                const floor = floorPremiums[floorNumber];
                /* eslint-enable security/detect-object-injection */

                const formattedFloor = {
                    id: floor.id,
                    floor: parseInt(floorNumber, 10),
                    premium_cost:
                        parseFloat(floor.premiumCost).toFixed(2) || "0.00", // Default to 0 if invalid
                    lucky_number:
                        typeof floor.luckyNumber === "boolean"
                            ? floor.luckyNumber
                            : false,
                    excluded_units: Array.isArray(floor.excludedUnits)
                        ? floor.excludedUnits
                        : [],
                };
                acc.push(formattedFloor);
                return acc;
            },
            []
        );
        return formattedFloorPremiums;
    },

    formatAdditionalPremiumsPayload: (additionalPremiums) => {
        const formattedAdditionalPremiums = additionalPremiums.map(
            (premium) => {
                const formattedPremium = {
                    id: parseInt(premium.id),
                    view_name: premium.viewName,
                    premium_cost: parseFloat(premium.premiumCost).toFixed(2),
                    excluded_units: premium.excludedUnitIds,
                };
                return formattedPremium;
            }
        );
        return formattedAdditionalPremiums;
    },
};
