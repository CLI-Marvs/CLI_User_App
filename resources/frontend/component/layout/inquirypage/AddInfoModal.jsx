import React, { useEffect, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { data } from "autoprefixer";

const AddInfoModal = ({ modalRef, dataConcern }) => {
    const [message, setMessage] = useState("");
    const [dataToUpdate, setDataToUpdate] = useState({
        contract_number: dataConcern.contract_number || "",
        unit_number: dataConcern.unit_number || "",
        property: dataConcern.property || "",
        remarks: dataConcern.details_message || "",
        buyer_email: dataConcern.buyer_email || "",
        mobile_number: dataConcern.mobile_number || "",
        name: dataConcern.buyer_name || "",
    });

    const projectList = [
        "N/A",
        "38 Park Avenue",
        "Astra Centre",
        "Asia Premiere",
        "Base Line Center Phase 2",
        "Baseline Center",
        "Baseline Residences",
        "Casa Mira Bacolod",
        "Casa Mira Coast Sibulan",
        "Casa Mira Homes Butuan",
        "Casa Mira Iloilo Camalig",
        "Casa Mira Linao",
        "Casa Mira Towers CDO",
        "Casa Mira Towers Guadalupe",
        "Casa Mira Towers Labangon",
        "Casa Mira Towers LPU Davao",
        "Casa Mira Towers Mandaue",
        "Casamira South",
        "Calle 104",
        "Casa Mira Dumaguete",
        "Casa Mira Towers Bacolod",
        "Casa Mira Towers Palawan",
        "Costa Mira Beachtown",
        "Costa Mira Beachtown Panglao",
        "Latitude Corporate Center",
        "Mesaverte Residences",
        "Mesavirre Garden Residences",
        "Midori Residences",
        "Mivela Garden Residences",
        "Mivesa Garden Residences",
        "Mandtra Residences",
        "Midori Plains",
        "Mindara Residences",
        "Patria De Cebu",
        "Park Centrale Tower",
        "San Jose Maria Village - Balamban",
        "San Jose Maria Village - Minglanilla",
        "San Jose Maria Village - Toledo",
        "San Josemaria Village - Talisay",
        "Test Project",
        "The East Village",
        "Velmiro Greens Bohol",
        "Velmiro Heights",
        "Velmiro Heights Uptown",
        "Velmiro Plains Bacolod",
        "Villa Casita - Balamban",
        "Villa Casita - Bogo",
    ];

    const maxCharacters = 500;

    const handleChangeValue = (e) => {
        const newValue = e.target.value;
        setMessage(newValue);
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setDataToUpdate({
            ...dataToUpdate,
            [e.target.name]: newValue,
        });
    };

    const addInfo = async () => {
        try {
            const response = await apiService.put(
                `update-info?dataId=${dataConcern.id}`,
                {...dataToUpdate}
            );

            console.log("response", response);
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        if (dataConcern) {
            setDataToUpdate({
                contract_number: dataConcern.contract_number || "",
                unit_number: dataConcern.unit_number || "",
                property: dataConcern.property || "",
                remarks: dataConcern.details_message || "",
                buyer_email: dataConcern.buyer_email || "",
                mobile_number: dataConcern.mobile_number || "",
                name: dataConcern.buyer_name || "",
            });
        }
    }, []);
    return (
        <dialog
            id="Resolved"
            className="modal w-[587px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" rounded-[10px]">
                <div className="absolute right-0">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end mr-2"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className=" px-[50px] py-[77px] flex flex-col gap-[40px]">
                    <div className="flex flex-col gap-[10px]">
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Name
                            </span>
                            <input
                                name="name"
                                value={dataToUpdate.name || ""}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Email
                            </span>
                            <input
                                name="buyer_email"
                                value={dataToUpdate.buyer_email || ""}
                                onChange={handleChange}
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Mobile Phone No.
                            </span>
                            <input
                                name="mobile_number"
                                type="number"
                                onChange={handleChange}
                                value={dataToUpdate.mobile_number || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Contract No.
                            </span>
                            <input
                                name="contract_number"
                                type="number"
                                onChange={handleChange}
                                value={dataToUpdate.contract_number || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[300px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    value={dataToUpdate.property || ""} 
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Please Select)</option>
                                    {projectList.map((project, index) => (
                                        <option key={index} value={project}>
                                            {project}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Unit/Lot
                            </span>
                            <input
                                name="unit_number"
                                onChange={handleChange}
                                value={dataToUpdate.unit_number || ""}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div
                        className={`border-[D6D6D6] rounded-[5px] bg-[#EDEDED] border`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-gray81 text-sm bg-[#EDEDED] pl-3 flex-grow mobile:text-xs mobile:w-[170px]">
                                CLI Admin Notes
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border border-[D6D6D6] pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-r-[4px]">
                                {" "}
                                {message.length}/500 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                value={message}
                                onChange={handleChangeValue}
                                maxLength={maxCharacters}
                                name="details_message"
                                rows="4"
                                draggable="false"
                                className={` rounded-[5px] bg-white border border-[D6D6D6] w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <form method="dialog">
                            <button className="w-[133px] h-[39px] gradient-btn5 font-semibold text-sm text-white rounded-[10px]" onClick={addInfo}>
                                Update
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddInfoModal;
