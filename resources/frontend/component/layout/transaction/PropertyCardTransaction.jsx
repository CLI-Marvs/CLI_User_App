import React, { useRef, useState } from "react";
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
        <div
            ref={scrollRef}
            className="flex  py-3 gap-[27px] mt-5 mb-5 overflow-x-hidden cursor-grab active:cursor-grabbing"
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
                    className="relative shadow-custom10 rounded-xl min-w-[321px] transition-transform duration-300 ease-in-out"
                    key={item.id}
                    onClick={() => handleShowUnits(item.id)}
                >
                    <img
                        src={item.image}
                        draggable="false"
                        alt={item.name}
                        className="rounded-xl w-[321px] h-[237px]"
                    />

                    <div className="absolute rounded-b-xl flex items-center bottom-0 bg-gradient-to-b from-[#7272723B] to-[#3A3A3A3B] w-full py-3 px-5 backdrop-blur-[3px]">
                        {showUnits === item.id ? (
                            <div className="flex flex-col gap-2 w-full">
                                {item.units.map((unit, index) => (
                                    <div
                                        key={index}
                                        className="w-full flex items-center justify-start py-3 px-3 text-center bg-white/40 backdrop-blur-lg h-[36px] rounded-lg text-gray-800 font-semibold shadow-md"
                                    >
                                        <span className="text-white text-sm">
                                            {unit.unit_number} ({unit.unit_id})
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
                                    <span className="text-xs text-white">
                                        {/*  {item.unit_number}&nbsp; */}
                                    </span>
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
    );
};
export default PropertyCardTransaction;
