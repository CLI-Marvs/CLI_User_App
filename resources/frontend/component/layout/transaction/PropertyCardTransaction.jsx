import React, { useState } from "react";
import SamplePic from "../../../../../public/Images/PcBldg.jpeg";
import hero from "../../../../../public/Images/hero-section.png";

const PropertyCardTransaction = () => {
    const data = [
        { id: 1, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: SamplePic, unit_number: "Unit T.127" },
        { id: 2, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: hero, unit_number: "Unit T.127" },
        { id: 3, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: SamplePic, unit_number: "Unit T.127" },
        { id: 4, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: SamplePic, unit_number: "Unit T.127" },
        { id: 5, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: SamplePic, unit_number: "Unit T.127" },
        { id: 6, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: hero, unit_number: "Unit T.127" },
        { id: 7, name: "Casa Mira Towers", address: "G.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City", image: SamplePic, unit_number: "Unit T.127" },
    ];

    return (
        <div className="flex py-3 gap-[27px] mt-5 mb-5 transaction-card-scrollbar">
            {data.map((item) => (
                <div
                    className="relative shadow-custom10 rounded-xl min-w-[321px]"
                    key={item.id}
                >
                    <img
                        src={item.image}
                        alt={item.name}
                        className="rounded-xl w-[321px] h-[237px]"
                    />
                    <div className="absolute rounded-b-xl flex items-center bottom-0 bg-gradient-to-b from-[#7272723B] to-[#3A3A3A3B] w-full py-3 px-5 backdrop-blur-[3px]">
                        <div className="flex flex-col items-start">
                            <span className="text-[#A9EE90] text-xl">
                                {item.name}
                            </span>
                           <div className="">
                           <span className="text-xs text-white">
                                {item.address}&nbsp;
                            </span>
                            <span className="text-xs text-white">
                                {item.unit_number}&nbsp;
                            </span>
                            <span className="text-xs text-white">
                                (3000000277)
                            </span>
                           </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PropertyCardTransaction;
