import React, { useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const CallBackView = () => {
    const { setToken } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            setToken(token);
            navigate("/inquirymanagement/inquirylist", { replace: true });
        }
    }, [navigate]);


};

export default CallBackView;
