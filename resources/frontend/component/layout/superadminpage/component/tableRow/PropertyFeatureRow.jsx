import React from "react";

const PropertyFeatureRow = ({ item }) => {
    console.log("item", item);
    return (
        <tr className="flex gap-4 mt-2 h-[144px] shadow-custom5 rounded-[10px] overflow-hidden px-4 bg-white text-custom-bluegreen text-sm">
            {/* Property Name */}
            <td className="w-[200px] flex items-center justify-start">
                <p className="font-bold">{item.property_name}</p>
            </td>

            {/* Description */}
            <td className="w-[200px] flex items-center justify-start">
                <p>{item.description || "N/A"}</p>
            </td>

            {/* Entity */}
            <td className="w-[150px] flex items-center justify-start">
                <p>{item.entity || "N/A"}</p>
            </td>

            {/* Features */}
            <td className="w-[300px] flex flex-col items-start justify-start">
                {item.features.map((feature) => (
                    <div
                        key={feature.id}
                        className={`px-2 py-1 rounded ${
                            feature.status === "enabled"
                                ? "bg-green-200"
                                : "bg-red-200"
                        }`}
                    >
                        {feature.name} - {feature.status}
                    </div>
                ))}
            </td>
        </tr>
    );
};

export default PropertyFeatureRow;
