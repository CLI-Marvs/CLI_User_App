import React from "react";

const WalkinTableRow = ({ item, onOpenModal }) => {
    return (
        <tr className="text-center">
            <td className="montserrat-medium">{item.priority_number}</td>
            <td>{item.person_type?.name}</td>
            <td>{item.category?.name}</td>

            <td className="flex justify-center items-center">
                {/* <button onClick={() => console.log("Edit", item.id)}>Edit</button>
                <button onClick={() => console.log("Delete", item.id)}>Delete</button> */}
                <button
                    // onClick={handleSubmit}
                    // disabled={loading}
                    type="submit"
                    className={`w-[133px] text-sm montserrat-semibold text-white h-[40px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4 mt-1`}
                    onClick={() => onOpenModal(item)}
                >
                    Engage
                </button>
            </td>
        </tr>
    );
};

export default WalkinTableRow;
