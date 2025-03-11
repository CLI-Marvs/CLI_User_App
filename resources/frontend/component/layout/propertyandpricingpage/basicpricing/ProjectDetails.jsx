import React, { useRef, useEffect, useState } from "react";
import { toLowerCaseText } from "@/component/layout/propertyandpricingpage/utils/formatToLowerCase";
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useLoadScript,
} from "@react-google-maps/api";
import CircularProgress from "@mui/material/CircularProgress";


const ProjectDetails = ({ propertyData }) => {
    // Extract property details with fallback values
    const latitude =
        parseFloat(propertyData?.data?.property_commercial_detail?.latitude) ||
        parseFloat(propertyData?.property_commercial_detail?.latitude) ||
        0;
    const longitude =
        parseFloat(propertyData?.data?.property_commercial_detail?.longitude) ||
        parseFloat(propertyData?.property_commercial_detail?.longitude) ||
        0;
 
    // Map location data
    const location = { lat: latitude, lng: longitude };

    // Load the Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,  
    });

    // Map container style
    const mapContainerStyle = {
        width: "100%",
        height: "100%",
        borderRadius: "0.50rem",
    };

    return (
        <>
            <div className="min-w-full  bg-custom-lightestgreen p-[20px] rounded-[10px] ">
                <div className="h-full flex  gap-x-4">
                    <div className="max-w-[350px] w-full  h-[259px]  flex-shrink-0">
                        {!isLoaded ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <GoogleMap
                                options={{
                                    mapTypeControl: false, // Hides the Map/Satellite option
                                    zoomControl: true, //  Hides the Zoom control
                                    streetViewControl: false,
                                }}
                                mapContainerStyle={mapContainerStyle}
                                center={{
                                    lat: location.lat,
                                    lng: location.lng,
                                }}
                                zoom={16}
                            >
                                <Marker
                                    position={{
                                        lat: location.lat,
                                        lng: location.lng,
                                    }}
                                />
                            </GoogleMap>
                        )}
                    </div>
                    <div className="mt-8">
                        <div className="flex gap-1 py-2">
                            <div>
                                <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                    Property Name
                                </p>
                            </div>
                            <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                                <p className="text-custom-gray81 text-xs">
                                    {toLowerCaseText(
                                        propertyData?.data?.property_name ||
                                            propertyData?.property_name
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1  py-2">
                            <div>
                                <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                    Type
                                </p>
                            </div>
                            <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                                <p className="text-custom-gray81 text-xs">
                                    {propertyData?.data
                                        ?.property_commercial_detail?.type ||
                                        propertyData?.property_commercial_detail
                                            ?.type}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1  py-2">
                            <div>
                                <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                    Tower/Phase
                                </p>
                            </div>
                            <div className=" w-auto h-[26px] px-[15px] py-[5px] bg-white rounded-[5px]">
                                <p className=" text-custom-gray81 text-xs">
                                    {propertyData?.data?.tower_phases[0]
                                        ?.tower_phase_name ||
                                        propertyData?.tower_phase_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1  py-2 ">
                            <div className="">
                                <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                    Description
                                </p>
                            </div>
                            <div className=" w-auto h-auto px-[15px] py-[5px] bg-white rounded-[5px] mr-2">
                                <p className=" text-custom-gray81 text-xs">
                                    {propertyData?.data?.tower_phases[0]
                                        ?.tower_description ||
                                        propertyData?.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectDetails;
