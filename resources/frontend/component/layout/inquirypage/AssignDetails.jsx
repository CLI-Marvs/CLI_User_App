import React from "react";

const AssignDetails = ({ logMessages }) => {
   

    return (
        <>
           <div className="w-full p-[10px] mt-[12px] flex flex-col gap-[10px]">
                <div className="flex flex-col gap-[10px]">
                    <div className="flex gap-1 text-sm montserrat-medium">
                    <p className="montserrat-medium text-sm">September 10, 2024</p>
                    <span className="text-custom-gray81">09:15 AM</span>
                    <span>|</span>
                    <p className="text-custom-bluegreen">Jannet Doe</p>
                    </div>
                    <div className="w-full min-h-[39px] border-[2px] border-custom-grayF1 p-[10px] rounded-[10px]">
                        <p className="text-sm">Hi Jack, I added you in this inquiry, maybe you can provide info.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px]">
                    <div className="flex gap-1 text-sm montserrat-medium">
                        <span className="text-custom-gray81">09:00 AM</span><p className="text-custom-bluegreen">Jannet Doe</p>
                    </div>
                    <div className="w-full">
                           <p className="montserrat-medium text-sm text-custom-solidgreen">Added assignee: Jack Doe</p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1">
                        <span className="text-custom-gray81">8:00 AM</span><p className="text-custom-solidgreen">Follow up reply</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jack Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">Customer Relations Services</p>
                    </div>
                </div>
           </div>
        </>
    );
};

export default AssignDetails;
