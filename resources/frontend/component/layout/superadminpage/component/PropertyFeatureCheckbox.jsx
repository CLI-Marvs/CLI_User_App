import React from "react";

const PropertyFeatureChecbox = ({
    checked,
    onChange,
    isDisabled = false,
    className,
    type = "checkbox",
    name,
    value
}) => {
    return (
        <input
            type={type}
            name={name}
            value={value}
            className={`${type === "checkbox" ? "property-feature-checkbox" : "property-feature-radio"} ${isDisabled ? "custom-checkbox-permission" : ""
                } ${className}`}
            checked={checked || false}
            disabled={isDisabled}
            onChange={(e) => {
                if (!isDisabled) {
                    onChange(e);
                }
            }}
        />
    );
};

export default PropertyFeatureChecbox;
