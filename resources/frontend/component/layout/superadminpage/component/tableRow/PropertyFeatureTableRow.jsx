import PropertyFeatureCheckbox from "@/component/layout/superadminpage/component/PropertyFeatureCheckbox";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { HiPencil } from "react-icons/hi";

const PropertyFeatureTableRow = ({ item, handleOpenModal, propertySettingColumns }) => {
    return (
        <tr className="even:bg-custombg3 h-16">
            <td className="px-4 py-2 montserrat-regular">
                {toLowerCaseText(item?.property_name)}
            </td>

            <td className="px-4 py-2 montserrat-regular">
                {item.description || "N/A"}
            </td>

            <td className="px-4 py-2 montserrat-regular">
                {item.entity || "N/A"}
            </td>

            {propertySettingColumns &&
                propertySettingColumns
                    .slice(3, -1)
                    .map((featureColumn, colIndex) => {
                        const feature = item.features.find(
                            (f) => f.name === featureColumn.label
                        );
                        return (
                            <td
                                key={colIndex}
                                className="px-4 py-2 montserrat-regular text-start"
                            >
                                {feature ? (
                                    <PropertyFeatureCheckbox
                                        checked={feature.status === "Enabled"}
                                        isDisabled={true}
                                    />
                                ) : (
                                    <div>
                                        <PropertyFeatureCheckbox
                                            checked={false}
                                            isDisabled={true}
                                            className="custom-checkbox-permission"
                                        />
                                    </div>
                                )}
                            </td>
                        );
                    })}

            <td className="px-4 py-2 montserrat-regular text-start">
                <HiPencil
                    onClick={() => handleOpenModal(item, "edit")}
                    className="w-5 h-5 text-custom-bluegreen cursor-pointer"
                />
            </td>
        </tr>
    );
};

export default PropertyFeatureTableRow;