import React from "react";
import guide from "../../../../../../public/Images/guide_image.png"; // Adjust the path as necessary

const GuideImage = () => {
    return (
        <div className="w-[300px] p-2 bg-white border rounded-lg shadow-lg">
            <img 
                src={guide} // place your image in public/images
                alt="Print Settings Guide"
                className="rounded"
                width={935}
                height={635}
            />
        </div>
    );
};

export default GuideImage;
