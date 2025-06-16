import React from "react";
import defaultAvatar from "../../../../../../public/Images/AdminSilouette.svg";
import attachIcon from "../../../../../../public/Images/attachfile.png";

const FIELDS = [
    { label: "First Name", name: "firstname" },
    { label: "Middle Name", name: "middlename" },
    { label: "Last Name", name: "lastname" },
    { label: "Country", name: "country" },
    { label: "City", name: "city" },
    { label: "Address", name: "address" },
    { label: "Email", name: "email" },
    { label: "Phone Number", name: "mobile_number" },
    { label: "Birthday", name: "birhday" },
    { label: "Citizenship", name: "citizenship" },
    { label: "Gender", name: "gender" },
    { label: "Zip Code", name: "zipcode" },
];
const BuyerModal = ({ buyerRef }) => {
    const handleCloseModal = () => {
        if (buyerRef.current) {
            buyerRef.current.close();
        }

    };
    return (
        <dialog
            className="modal w-[669px] rounded-[10px] shadow-custom5 backdrop:bg-black/50 outline-none transaction-scrollbar"
            ref={buyerRef}
        >
            <div className="bg-custombg3 w-auto h-auto px-5 py-5 rounded-[10px] space-y-5">
                <div className="flex justify-center bg-white py-7 items-center gap-5 rounded-[10px] relatie">
                    <img
                        src={defaultAvatar}
                        alt=""
                        className="w-[130px] h-[130px]"
                    />
                    <div className="flex flex-col items-center space-y-3">
                        <span className="font-semibold text-xl border-b-[1px] border-black pb-2">
                            Kent Jeffery A. Armelia
                        </span>
                        <div className="flex bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[10px] justify-center items-center shadow-md w-[150px] px-3 py-3 h-[40px] space-x-2">
                            <img src={attachIcon} alt="" />
                            <button className="text-white">Change Image</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-full absolute top-2 right-5 h-6 w-6 shadow-md flex justify-center cursor-pointer" onClick={handleCloseModal}>
                        <span className="">X</span>
                    </div>
                </div>
                <div className="bg-white py-[20px] px-[35px] rounded-[10px]">
                    <h1 className="font-semibold mb-4 text-lg">
                        Buyer's Information
                    </h1>
                    <div className="grid grid-cols-2 gap-5">
                        {FIELDS.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col space-y-2"
                            >
                                <label className="text-sm">{item.label}</label>
                                <input
                                    type="text"
                                    name={item.name}
                                    className="border border-gray-300 rounded-[5px] p-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white py-[20px] px-[35px] rounded-[10px]">
                    <h1 className="font-semibold mb-4 text-lg">
                        Buyer's Spouse Information
                    </h1>
                    <div className="grid grid-cols-2 gap-5 mb-4">
                        {FIELDS.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col space-y-2"
                            >
                                <label className="text-sm">{item.label}</label>
                                <input
                                    type="text"
                                    name={item.name}
                                    className="border border-gray-300 rounded-[5px] p-2"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <div className="flex justify-center bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[10px] items-center shadow-md w-[150px] px-3 py-3 h-[40px] space-x-2">
                            <button className="text-white">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default BuyerModal;
