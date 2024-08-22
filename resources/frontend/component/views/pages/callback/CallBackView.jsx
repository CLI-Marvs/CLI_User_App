import React from "react";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const CallBackView = () => {
    const { setUser, setToken } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            setToken(token);
            navigate("/inquirymanagement", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const getData = async () => {
            const response = await apiService.get("user");
            setUser(response.data);
        };
        getData();
    }, []);
    return <div></div>;
};

export default CallBackView;
