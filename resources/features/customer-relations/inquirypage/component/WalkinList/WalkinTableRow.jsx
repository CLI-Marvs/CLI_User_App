import React from "react";
import Button from "@/features/customer-relations/inquirypage/component/ui/button";

const WalkinTableRow = ({ item, onOpenModal }) => {
    return (
        <tr className="text-center">
            <td className="montserrat-medium">{item.priority_number}</td>
            <td className="montserrat-regular">{item.person_type?.name}</td>

            <td className="flex justify-center items-center">
                <Button
                    className=" w-[150px] h-[35px] rounded-[5px] text-sm montserrat-semibold flex items-center justify-center gap-4 hover:shadow-custom4 mt-2  gradient-btn2 text-white"
                    onClick={() => onOpenModal(item)}
                >
                    Engage
                </Button>
            </td>
        </tr>
    );
};

export default WalkinTableRow;
