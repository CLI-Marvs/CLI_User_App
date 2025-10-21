import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipArrow,
} from "@/components/ui/tooltip"

const IndividualTable = () => {
    return (
        <>
            <div className='overflow-auto'>
                <TooltipProvider delayDuration={0}>
                    <table className="min-w-full border border-gray-200 text-sm text-left">
                        <thead className="bg-custom-lightestgreen h-[40px]">
                            <tr>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Timestamp</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Email Address</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[143px]">Ticket ID</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Survey Owner</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">
                                    <Tooltip>
                                        <TooltipTrigger>Question 1</TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={20} align="center" className="bg-white text-black shadow-md">
                                            <p>lorem ipsum</p>
                                            <TooltipArrow className="fill-white drop-shadow-md" width={12} height={6} />
                                        </TooltipContent>
                                    </Tooltip>
                                </th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">
                                    <Tooltip>
                                        <TooltipTrigger>Question 2</TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={20} align="center" className="bg-white text-black shadow-md">
                                            <p>lorem ipsum</p>
                                            <TooltipArrow className="fill-white drop-shadow-md" width={12} height={6} />
                                        </TooltipContent>
                                    </Tooltip>
                                </th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Question 3</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Question 4</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Question 5</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Qeustion 6</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Reason</th>
                                <th className=" px-2 py-2 montserrat-bold min-w-[112px]">Improvement</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-custom-lightestgreen'>
                            <tr className="hover:bg-[#F5F9F3] h-[71px] cursor-pointer">
                                <td className="flex flex-col justify-center items-start h-[71px] px-[8px] ">
                                    <span>
                                        Jun 9, 2025
                                    </span>
                                    <span className='text-xs text-[#9A9A9A]'>
                                        8:59 AM
                                    </span>
                                </td>
                                <td className=" px-4 py-2">johndoe@gmail.com</td>
                                <td className=" px-4 py-2">Ticket#251112668</td>
                                <td className=" px-4 py-2">sample name</td>
                                <td className="px-4 py-2">
                                    {(() => {
                                        const rating = "Dissatisfied";

                                        const colorMap = {
                                            "Very Dissatisfied": "bg-red-700",
                                            "Dissatisfied": "bg-red-500",
                                            "Neutral": "bg-yellow-500",
                                            "Satisfied": "bg-green-500",
                                            "Very Satisfied": "bg-green-700",
                                        };

                                        const isSatisfaction = Object.keys(colorMap).includes(rating);

                                        if (!isSatisfaction) return <span>{rating}</span>;

                                        return (
                                            <span
                                                className={`${colorMap[rating]} text-white font-medium px-2 py-[1.5px] rounded-[4px]`}
                                            >
                                                {rating}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className=" px-4 py-2">Neutral</td>
                                <td className=" px-4 py-2">Very Dissatisfied</td>
                                <td className=" px-4 py-2">Very Satisfied</td>
                                <td className="">
                                    <div className='flex justify-center'>
                                        {(() => {
                                            const rating = "7";

                                            const colorMap = {
                                                "Very Dissatisfied": "bg-red-700",
                                                "Dissatisfied": "bg-red-500",
                                                "7": "bg-yellow-500",
                                                "Satisfied": "bg-green-500",
                                                "Very Satisfied": "bg-green-700",
                                            };

                                            const isSatisfaction = Object.keys(colorMap).includes(rating);

                                            if (!isSatisfaction) return <span>{rating}</span>;

                                            return (
                                                <span
                                                    className={`${colorMap[rating]} text-white font-medium px-[13px] py-[1.5px] rounded-[4px]`}
                                                >
                                                    {rating}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </td>
                                <td className=" px-4 py-2">8</td>
                                <td className=" px-4 py-2">N/A</td>
                                <td className=" px-4 py-2">service,support</td>
                            </tr>

                        </tbody>
                    </table>
                </TooltipProvider>
            </div>

            <div className='p-[16px] '>
                <div className='flex justify-between'>
                    <div>
                        <p>page 1 of 11</p>
                    </div>
                    <div className='flex gap-2'>
                        <div className='flex gap-[6px]'>
                            <div>
                                -
                            </div>
                            <div>
                                previous
                            </div>
                        </div>
                        <div className='flex gap-[6px]'>
                            <div>
                                Next
                            </div>
                            <div>
                                -
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default IndividualTable