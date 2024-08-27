import React, { useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const CallBackView = () => {
    const { setUser, setToken } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        console.log(token);

        if (token) {
            setToken(token);
            navigate("/inquirymanagement/inquirylist", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const getData = async () => {
            const response = await apiService.get("user");
            console.log("response data user", response.data);
            setUser(response.data);
        };
        getData();
    }, [setUser]);
    return <div></div>;
};

export default CallBackView;
