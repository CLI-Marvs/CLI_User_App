import React from 'react'
import moment from "moment";

const WalkinHistoryTableRow = ({ item , onClick }) => {
    return (
        <tr
            className={`bg-white border-b-8 border-gray-50 cursor-pointer`}
            onClick={() => onClick?.(item)}
            tabIndex={0}
        >
            <td className="w-[200px] py-4 montserrat-regular px-2">
                {item?.walkin_transaction_detail.first_name}{" "}
                {item?.walkin_transaction_detail.last_name}
            </td>
            <td className="w-[250px] py-4 montserrat-regular px-1">
                {item?.priority_number}
            </td>
            <td className="w-[150px] py-4 montserrat-regular px-1">
                {item?.walkin_transaction_detail?.category?.name || "N/A"}
            </td>
            <td className="w-[200px] py-4 capitalize montserrat-regular px-1">
                {item?.status || "N/A"}
            </td>
            <td className="w-[150px] py-4 montserrat-regular px-1">
                {moment(item?.created_at).format("hh:mm:ss A YYYY-MM-DD")}
            </td>
        </tr>
    );
}

export default WalkinHistoryTableRow