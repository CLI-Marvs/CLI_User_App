import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
 

export const showToast = (message, type = "success", options = {}) => {

    const baseOptions = {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
        pauseOnFocusLoss: true,
    };

    // Merge base options with custom options
    const finalOptions = { ...baseOptions, ...options };

    switch (type) {
        case "success":
            toast.success(message, finalOptions);
            break;
        case "warning":
            toast.warning(message, finalOptions);
            break;
        case "error":
            toast.error(message, finalOptions);
            break;
        case "info":
            toast.info(message, finalOptions);
            break;
        default:
            toast(message, finalOptions); // Default generic toast
            break;
    }
 
};
