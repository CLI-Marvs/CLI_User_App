import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { HiPencil } from "react-icons/hi";



const PropertyFeatureTableRow = ({ item, handleOpenModal }) => {
    return (
        <tr className="flex gap-4 mt-2 shadow-custom5 rounded-[10px] overflow-hidden px-4 bg-white h-16">
            {/* Property Name */}
            <td className="w-[200px] flex items-center justify-start">
                <div className="montserrat-regular">
                    {toLowerCaseText(item?.property_name)}
                </div>
            </td>

            {/* Description */}
            <td className="w-[200px] flex items-center justify-start">
                <div className="montserrat-regular">
                    {item.description || "N/A"}
                </div>
            </td>

            {/* Entity */}
            <td className="w-[120px] flex items-center justify-start">
                <div className="montserrat-regular">
                    {item.entity || "N/A"}
                </div>
            </td>

            {/* Dynamic feature columns */}
            {item.features.map((feature, index) => (
                <td key={index} className="w-[100px] flex items-center justify-start">
                    <PropertyFeatureCheckbox
                        checked={feature.status === "Enabled"}
                        isDisabled={true}
                    />
                </td>
            ))}

            {/* Actions */}
            <td className="w-[62px] flex items-center justify-start">
                <HiPencil
                    onClick={() => handleOpenModal(item, "edit")}
                    className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                />
            </td>
        </tr>
    );
};

export default PropertyFeatureTableRow;