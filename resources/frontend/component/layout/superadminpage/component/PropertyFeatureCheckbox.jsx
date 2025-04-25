import React from "react";

const PropertyFeatureChecbox = ({ checked, onChange, isDisabled = false }) => {
    return (
        <input
            type="checkbox"
            className={`h-[16px] w-[16px] property-feature-checkbox text-white ${
                isDisabled ? "cursor-not-allowed bg-custom-grayF1 " : ""
            }`}
            checked={checked || false}
            onChange={(e) => {
                if (!isDisabled) {
                    onChange(e); 
                }
            }}
        />
    );
};

export default PropertyFeatureChecbox;
