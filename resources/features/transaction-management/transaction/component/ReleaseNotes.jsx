import React from "react";

const ReleaseNotes = ({
    date,
    title = "",
    features = [],
    extras = [],
    className = "",
}) => {
    return (
        <div
            className={`flex gap-[24px] w-[1033px] min-h-[100px] p-[30px] ${className}`}
        >
            {/* Date */}
            <div className="flex w-[150px] shrink-0">
                <p className="text-[#717171]">{date}</p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-[24px]">
                <div className="w-full flex flex-col gap-[12px]">
                    {/* Title */}
                    {title && (
                        <div>
                            <p className="text-[#2A2A2A]">{title}</p>
                        </div>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <div className="flex flex-col text-[#717171]">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex">
                                    {idx === 0 ? (
                                        <div className="font-semibold text-[#2A2A2A]">
                                            {feature}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex w-[30px] shrink-0 justify-center">
                                                •
                                            </div>
                                            <div>{feature}</div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Extras */}
                    {extras.length > 0 && (
                        <div className="flex flex-col text-[#717171]">
                            {extras.map((extra, idx) => (
                                <div key={idx} className="text-[#2A2A2A]">
                                    {extra}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReleaseNotes;
