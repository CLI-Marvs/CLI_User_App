import { CircularProgress } from "@mui/material";
import React from "react";

const Spinner = ({ className, color }) => {
    return (
        <div>
            <CircularProgress color={color} className="spinnerSize" />
        </div>
    );
};

export default Spinner;
