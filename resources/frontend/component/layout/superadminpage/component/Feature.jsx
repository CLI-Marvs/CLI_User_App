import React from "react";
import { PERMISSIONS } from "@/constant/data/permissions";
import PermissionCheckbox from "@/component/layout/superadminpage/component/PermissionCheckbox";
import CustomToolTip from "../../mainComponent/Tooltip/CustomToolTip";

const Feature = ({
    item,
    formData,
    handleFeaturePermissionChange,
    checkedExtractor = null,
}) => {
    return (
        <div
            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]`}
        >
            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                {item.name}
            </span>
            <div className="relative h-full w-full flex justify-center items-center overflow-visible">
                <div className="w-[342px] h-[44px]">
                    <div className="w-full h-[44px] gap-[63px] flex items-center justify-center rounded-[5px] ">
                        {PERMISSIONS &&
                            PERMISSIONS.map((permission) => (
                                <PermissionCheckbox
                                    permission={permission}
                                    key={permission.name}
                                    item={item}
                                    formData={formData}
                                    handleFeaturePermissionChange={
                                        handleFeaturePermissionChange
                                    }
                                    checkedExtractor={checkedExtractor}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feature;
