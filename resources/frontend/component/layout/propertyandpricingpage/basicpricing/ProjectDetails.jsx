import React, { useRef, useEffect, useState, useCallback } from "react";
import { toLowerCaseText } from "@/component/layout/propertyandpricingpage/utils/formatToLowerCase";
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useLoadScript,
} from "@react-google-maps/api";
import {
    GOOGLE_MAPS_LIBRARIES,
    DEFAULT_MAP_CONTAINER_STYLE,
    DEFAULT_MAP_OPTIONS,
} from "@/constant/googleMapsConfig";
import CircularProgress from "@mui/material/CircularProgress";
const mapId = import.meta.env.VITE_APP_GOOGLE_MAP_ID;
const ProjectDetails = ({ propertyData }) => {
    //States
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const infoWindowRef = useRef(null);
    const [address, setAddress] = useState("Fetching address...");

    // Extract property details with fallback values
    const latitude =
        parseFloat(
            propertyData?.data?.property_commercial_detail?.latitude ??
                propertyData?.property_commercial_detail?.latitude
        ) || 0;

    const longitude =
        parseFloat(
            propertyData?.data?.property_commercial_detail?.longitude ??
                propertyData?.property_commercial_detail?.longitude
        ) || 0;

    // Map location data
    const location = { lat: latitude, lng: longitude };
    // Function to get address from lat/lng
    const fetchAddress = useCallback((lat, lng, callback) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const formattedAddress = results[0].formatted_address.replace(
                    /, /g,
                    "<br>"
                );
                setAddress(formattedAddress);
                if (callback) callback(formattedAddress);
            } else {
                setAddress("Address not found");
                if (callback) callback("Address not found");
            }
        });
    }, []);

    //Hooks
    const onLoad = useCallback(
        (map) => {
            mapRef.current = map;
            if (window.google) {
                const position = {
                    lat: latitude,
                    lng: longitude,
                };
                console.log("location11",typeof latitude);

                markerRef.current =
                    new window.google.maps.marker.AdvancedMarkerElement({
                        position: position,
                        map: map,
                        title: "Hello World!",
                        gmpClickable: true,
                    });

                // Initialize InfoWindow
                infoWindowRef.current = new window.google.maps.InfoWindow();

                // Attach click event to marker
                markerRef.current.addListener("gmp-click", () => {
                    fetchAddress(
                        latitude,
                       longitude,
                        (resolvedAddress) => {
                            infoWindowRef.current.setContent(
                                `<p style="white-space: pre-line;">${resolvedAddress}</p>`
                            );
                            infoWindowRef.current.open(map, markerRef.current);
                        }
                    );
                });
            } else {
                markerRef.current.setPosition(position);
            }
        },
        [location, fetchAddress, latitude,longitude]
    );

    const onUnmount = useCallback(() => {
        if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
        }
        if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
        }
        mapRef.current = null;
    }, []);

    // Load the Google Maps script
    const { isLoaded } = useLoadScript({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        mapIds: [mapId],
    });

    return (
        <>
            <div className="min-w-full  bg-custom-lightestgreen p-[20px] rounded-[10px] ">
                <div className="h-full flex  gap-x-4">
                    <div className="max-w-[350px] w-full h-[259px] flex-shrink-0">
                        {!location.lat || !location.lng ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                                <p className="text-gray-500">
                                    No location data available
                                </p>
                            </div>
                        ) : !isLoaded ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <GoogleMap
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                options={{
                                    ...DEFAULT_MAP_OPTIONS,
                                    mapId: mapId,
                                }}
                                mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
                                center={{
                                    lat: location.lat,
                                    lng: location.lng,
                                }}
                                zoom={16}
                            ></GoogleMap>
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
