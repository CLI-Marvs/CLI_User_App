import React, { useEffect, useRef, useState } from "react";
import UploadUnitDetailsModal from "./modals/UploadUnitDetailsModal";
import { useStateContext } from "../../../../context/contextprovider";
const ProjectDetails = ({ localPropertyData }) => {
    //State
    // Destructure the necessary data from localPropertyData
    const { propertyMaster, towerPhase, propertyCommercialDetail } =
        localPropertyData.propertyData || {};

    const { property_name: propertyName, id } = propertyMaster || {};
    const { type } = propertyCommercialDetail || {};
    const { tower_phase_name, id: towerPhaseId } = towerPhase || {};
    const { propertyId, setPropertyId, setTowerPhaseId } = useStateContext();
    //Hooks
    useEffect(() => {
        if (id || towerPhaseId) {
            setPropertyId(id);
            setTowerPhaseId(towerPhaseId);
        }
    }, [id, towerPhaseId]);
    return (
        <>
            <div className="min-w-full h-[138px] bg-custom-lightestgreen p-[20px] rounded-[10px] ">
                <div className="h-full flex flex-col justify-between ">
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Property Name
                            </p>
                        </div>
                        <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className="text-custom-gray81 text-xs">
                                {propertyName}
                            </p>
                        </div>
                        ID {id}
                    </div>
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Type
                            </p>
                        </div>
                        <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className="text-custom-gray81 text-xs">{type}</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Tower/Phase
                            </p>
                        </div>
                        <div className=" w-auto h-[26px] px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className=" text-custom-gray81 text-xs">
                                {tower_phase_name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectDetails;
