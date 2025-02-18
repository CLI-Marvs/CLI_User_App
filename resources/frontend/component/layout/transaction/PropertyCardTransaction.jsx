import React, { useEffect, useRef, useState } from "react";
import SamplePic from "../../../../../public/Images/PcBldg.jpeg";
import hero from "../../../../../public/Images/hero-section.png";

const data = [
    {
        id: 1,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 2,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 3,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 4,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 5,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 6,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
    {
        id: 7,
        name: "Casa Mira Towers",
        address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City",
        image: SamplePic,
        units: [
            { unit_number: "Unit T.127", unit_id: "2000000293" },
            { unit_number: "Unit T.128", unit_id: "2000000667" },
            { unit_number: "Unit T.129", unit_id: "2000000212" },
            { unit_number: "Unit T.130", unit_id: "2000000888" },
        ],
    },
];
const PropertyCardTransaction = () => {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showUnits, setShowUnits] = useState(null);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasScrollbar, setHasScrollbar] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const checkScrollbar = () => {
            if (contentRef.current) {
                setHasScrollbar(
                    contentRef.current.scrollHeight >
                        contentRef.current.clientHeight
                );
            }
        };

        checkScrollbar();
        window.addEventListener("resize", checkScrollbar);

        return () => {
            window.removeEventListener("resize", checkScrollbar);
        };
    }, [showUnits]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - startX;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleShowUnits = (itemId) => {
        setShowUnits((prev) => (prev === itemId ? null : itemId));
    };

    return (
        <div className="bg-white space-y-1 py-5 rounded-[10px] mt-[27px] px-5">
            <div className="flex items-center">
                <span className="text-black text-xl font-semibold">
                    Properties
                </span>
                <div className="flex-1 border-b-[1px] border-black ml-2"></div>
            </div>
            <div
                ref={scrollRef}
                className={`flex py-3 rounded-[10px] gap-[27px] mt-5 mb-5 overflow-x-hidden cursor-grab active:cursor-grabbing`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
                onTouchStart={(e) => handleMouseDown(e.touches[0])}
                onTouchMove={(e) => handleMouseMove(e.touches[0])}
                onTouchEnd={handleMouseUp}
            >
                {data.map((item) => (
                    <div
                        className="relative overflow-hidden shadow-custom10 rounded-xl min-w-[321px]"
                        key={item.id}
                        onClick={() => handleShowUnits(item.id)}
                    >
                        <img
                            src={item.image}
                            draggable="false"
                            alt={item.name}
                            className="rounded-xl w-[321px] h-[237px]"
                        />

                        <div
                            className={`absolute flex items-center bottom-0 bg-gradient-to-b from-[#7272723B] to-[#3A3A3A3B] w-full px-5 backdrop-blur-[3px] transition-all duration-500 ease-in-out  ${
                                showUnits === item.id
                                    ? "rounded-xl min-h-[235px] h-[10px]"
                                    : "rounded-b-xl min-h-[87px] h-[87px]"
                            } overflow-hidden`}
                        >
                            {showUnits === item.id ? (
                                <div
                                    ref={contentRef}
                                    className={`flex flex-col gap-2 w-full h-[180px] customer-scrollbar ${
                                        hasScrollbar ? "pr-3" : ""
                                    }`}
                                >
                                    {item.units.map((unit, index) => (
                                        <div
                                            key={index}
                                            className="w-full flex items-center justify-start px-3 text-center py-2 bg-white/40 backdrop-blur-lg rounded-lg text-gray-800 font-semibold shadow-md"
                                        >
                                            <span className="text-white text-sm">
                                                {unit.unit_number} (
                                                {unit.unit_id})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-start">
                                    <span className="text-[#A9EE90] text-xl">
                                        {item.name}
                                    </span>
                                    <div>
                                        <span className="text-xs text-white">
                                            {item.address}&nbsp;
                                        </span>
                                        <span className="text-xs text-white"></span>
                                        <span className="text-xs text-white">
                                            (3000000277)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PropertyCardTransaction;
