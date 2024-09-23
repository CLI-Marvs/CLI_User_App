import React, { useEffect, useRef, useState } from "react";
import AssignDetails from "./AssignDetails";
import AssignModal from "./AssignModal";
import { useStateContext } from "../../../context/contextprovider";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const AssignSidePanel = ({ ticketId }) => {
    const { setTicketId, logs, allEmployees, user, data, specificInquiry } =
        useStateContext();
    const [isSelected, setIsSelected] = useState({});
    const [isAssign, setIsAssign] = useState(false);
    const logsMessages = logs[ticketId] || [];

    const modalRef = useRef(null);

    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};

    const handleOpenModal = () => {
        if (modalRef.current) {
            setIsAssign(dataConcern.resolve_from !== null);
            modalRef.current.showModal();
        }
    };

    const selectedEmployee = (event, value) => {
        setIsSelected(value);
    };

    const employeeOptions = allEmployees.map((employee) => ({
        label: `${employee.firstname} ${employee.lastname} (${employee.department})`,
        email: employee.employee_email,
        firstname: employee.firstname,
        department: employee.department,
        ticketId: ticketId,
    }));

    const assignedTicketId = specificInquiry
        ? specificInquiry.includes(ticketId)
        : null;
    const hasAccessToAssign = user?.department === "CSR" || assignedTicketId;
    useEffect(() => {
        setTicketId(ticketId);
    }, [ticketId, setTicketId]);

    return (
        <>
            <div className="">
                <div>
                    <Autocomplete
                        disablePortal
                        options={employeeOptions}
                        getOptionLabel={(option) => option.label}
                        onChange={selectedEmployee}
                        className="w-full rounded-[5px]"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Assign To"
                                size="small"
                                className="w-full rounded-[5px]"
                            />
                        )}
                    />
                </div>
                <div className="flex w-full justify-center items-center p-4">
                    <button
                        onClick={handleOpenModal}
                        className="h-9 gradient-btn2 hover:shadow-custom4 px-16 text-white rounded-lg"
                    >
                        {dataConcern.assign_to !== null ? (
                            <span>Reassign</span>
                        ) : (
                            <span>Assign</span>
                        )}
                    </button>
                </div>
                <div className="border border-t-1 border-custom-lightestgreen"></div>
                <div className="flex h-12 w-full gap-5 items-center justify-center mt-1">
                    <div className="flex w-36 justify-end">
                        <p className="text-xl text-custom-bluegreen montserrat-semibold">
                            (21 days ago)
                        </p>
                    </div>
                </div>
                <div className="h-full flex flex-col">
                    <div className=" h-[400px] overflow-y-auto">
                        <AssignDetails logMessages={logsMessages} />
                    </div>
                    <div className="border border-t-1 border-custom-lightestgreen flex-shrink-0"></div>
                </div>
            </div>
            <div>
                <AssignModal
                    modalRef={modalRef}
                    employeeData={isSelected}
                    isAssign={isAssign}
                />
            </div>
        </>
    );
};

export default AssignSidePanel;
