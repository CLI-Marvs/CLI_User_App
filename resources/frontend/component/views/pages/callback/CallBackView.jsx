import React, { useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const CallBackView = () => {
    const { setToken, setUserAccessData } = useStateContext();
    const navigate = useNavigate();

    // useEffect(async () => {
    //     // Extract the token and permissions
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const token = urlParams.get("token");

    //     if (token) {
    //         setToken(token);
    //         // Fetch user access data from API
    //         const response = await apiService.get("/user-access-data");
    //         const { userAccessData } = response.data;
    //         /* navigate("/inquirymanagement/inquirylist", { replace: true }); */
    //         navigate("/notification", { replace: true });
    //     }
    //     if (userAccessDataEncoded) {
    //         try {
    //             // Decode and parse the permissions
    //             const userAccessData = JSON.parse(
    //                 decodeURIComponent(userAccessDataEncoded)
    //             );
    //             setUserAccessData(userAccessData);
    //             // Save to sessionStorage
    //             sessionStorage.setItem(
    //                 "userAccessData",
    //                 JSON.stringify(userAccessData)
    //             );
    //         } catch (error) {
    //             console.error("Failed to decode permissions:", error);
    //         }
    //     }
    // }, [navigate, setUserAccessData]);
    useEffect(() => {
        const fetchUserAccess = async () => {
            try {
                // Extract token from URL
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get("token");

                if (token) {
                    setToken(token);

                    // Fetch user access data from API
                    const response = await apiService.get("/user-access-data");
                    const { userAccessData } = response.data;

                    setUserAccessData(userAccessData);
                    sessionStorage.setItem(
                        "userAccessData",
                        JSON.stringify(userAccessData)
                    );

                    navigate("/notification", { replace: true });
                }
            } catch (error) {
                console.error("Failed to fetch user access data:", error);
                navigate("/", { replace: true });
            }
        };

        fetchUserAccess();
    }, [navigate, setToken, setUserAccessData]);

    return null;
};

export default CallBackView;
