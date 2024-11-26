import React, { useState, useEffect } from "react";

const ImageSlideshow = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        },4000);

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [images.length]);

    return (
        <div className="relative w-[583px] h-[70px] overflow-hidden">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {images.map((image, index) => (
                    <a
                        key={index}
                        href={image.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex-shrink-0"
                    >
                        <img
                            src={image.src}
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