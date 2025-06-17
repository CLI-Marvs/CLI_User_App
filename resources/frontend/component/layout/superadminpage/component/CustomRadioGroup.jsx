import React from "react";

const CustomRadioGroup = ({ options, name, selectedValue, onChange, className }) => {
    return (
        <div className="flex justify-center gap-x-6 items-center mt-4">
            {options && options.map((option) => (
                <div key={option.value} className="flex gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <p className="text-custom-bluegreen montserrat-semibold text-sm">
                            {option.label}
                        </p>
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={() =>
                                onChange({
                                    target: {
                                        name: name,
                                        value: option.value,
                                    },
                                })
                            }
                            className={className || "property-feature-radio"}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CustomRadioGroup;
