import React from "react";
import moment from "moment";

const PaymentSchemeRow = ({ item }) => {
    return (
        <tr className="flex min-h-[68px] text-sm justify-start gap-[30px] px-[12px] even:bg-custombg3">
            <td
                className="flex flex-col justify-center w-[100px] pr-3 py-3"
                colSpan="100%"
            >
                <p className="font-bold text-custom-solidgreen">
                    {item?.status}
                </p>
                <p>{moment(item.created_at).format("M / D / YYYY")}</p>
            </td>
            <td className="flex items-center w-[150px]">
                <p>{item?.payment_scheme_name}</p>
            </td>
            <td className="flex items-center w-[200px] pr-3 py-3">
                <p>{item?.description}</p>
            </td>
            <td className="flex items-center w-[100px]">
                <p>{item?.spot}%</p>
            </td>
            <td className="flex items-center w-[100px] space-x-1">
                <p>{item?.downpayment_installment}%</p>
                {item?.number_months_downpayment > 0 && (
                    <p>({item.number_months_downpayment} mos)</p>
                )}
            </td>
            <td className="flex items-center w-[120px]">
                <p>{item?.bank_financing}% (100% LP - RF)</p>
            </td>
            <td className="flex items-center w-[120px]">
                <p>{item?.discount}%</p>
            </td>
        </tr>
    );
};

export default PaymentSchemeRow;
