import React, { useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const CallBackView = () => {
    const { setToken, setUserAccessData } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        // Extract the token and permissions
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const userAccessDataEncoded = urlParams.get('userAccessData');
       
        if (token) {
            setToken(token);
            /* navigate("/inquirymanagement/inquirylist", { replace: true }); */
            navigate("/notification", { replace: true });
        }
        if (userAccessDataEncoded) {
            try {
                // Decode and parse the permissions
                const userAccessData = JSON.parse(decodeURIComponent(userAccessDataEncoded));
                setUserAccessData(userAccessData);
                // Save to sessionStorage
                sessionStorage.setItem("userAccessData", JSON.stringify(userAccessData));
            } catch (error) {
                console.error('Failed to decode permissions:', error);
            }
        }
    }, [navigate, setUserAccessData]);


};

export default CallBackView;
