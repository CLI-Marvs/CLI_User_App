import React, { useRef } from "react";
import { AiFillInfoCircle } from "react-icons/ai";

/**
 * By default, the Confirm Text is "Yes" and the Cancel Text is "Cancel".
 * You can change these values by passing in the `confirmText` and `cancelText` props.
 */
const Alert = ({
    title = "Alert",
    onConfirm,
    onCancel,
    show,
    confirmText = "Yes",
    cancelText = "Cancel",
}) => {
    if (!show) return null; // Only render if `show` is true
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
            <div className="bg-white p-[20px] rounded-[10px] shadow-custom5 w-[450px] min-h-[250px]">
                <div className="p-[10px] flex flex-col gap-[26px]">
                    <div className="flex justify-center items-center">
                        <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                    </div>
                    <h1 className="montserrat-medium text-[20px] text-center">
                        {title}
                    </h1>
                    <div className="flex justify-end space-x-4 mt-10">
                        <button
                            onClick={onCancel}
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                        >
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    {cancelText}
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={onConfirm}
                            className="gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert;
