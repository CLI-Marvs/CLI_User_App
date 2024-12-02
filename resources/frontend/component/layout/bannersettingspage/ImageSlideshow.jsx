import React, { useState, useEffect } from "react";
import { useStateContext } from '../../../context/contextprovider'

const ImageSlideshow = () => {

    const { getBannerData, bannerLists } = useStateContext();


    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerLists.length);
        },4000);

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [bannerLists.length]);

    return (
        <div className="relative w-[583px] h-[70px] overflow-hidden">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {bannerLists && bannerLists.length > 0 && bannerLists.map((item, index) => (
                    <a
                        key={index}
                        href={item.banner_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex-shrink-0"
                    >
                        <img
                            src={item.banner_image}
                            alt={`Ad ${index}`}
                            className="w-full h-full object-cover"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ImageSlideshow;