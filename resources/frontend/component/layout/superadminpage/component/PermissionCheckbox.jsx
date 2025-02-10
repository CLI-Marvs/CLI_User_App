import React from 'react'

const PermissionCheckbox = ({ permission, item, formData, handleFeaturePermissionChange, checkedExtractor = null }) => {
    const isDisabled = ["S", "D", "E"].includes(permission.name);

    // Extract checked value based on the passed logic or fallback to default
    const isChecked = checkedExtractor
        ? checkedExtractor(item, permission, formData)
        : formData?.features?.find((feature) => feature.featureId === item.id)?.[permission.value] || false;

    return (
        <div className="flex flex-col gap-[2.75px] items-center">
            <p className="montserrat-semibold text-[10px] leading-[12.19px]">
                {permission.name}
            </p>
            <input
                checked={isChecked || false}
                type="checkbox"
                disabled={isDisabled}
                className={`h-[16px] w-[16px] custom-checkbox-permission ${
                    isDisabled ? "cursor-not-allowed bg-custom-grayF1 " : ""
                }`}
                onChange={(e) =>
                    handleFeaturePermissionChange(
                        item,
                        permission,
                        e.target.checked
                    )
                }
            />
        </div>
    );
}

export default PermissionCheckbox
