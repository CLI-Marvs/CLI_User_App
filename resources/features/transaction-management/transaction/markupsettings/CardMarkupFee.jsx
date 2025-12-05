import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import usePagination from "@/hooks/usePagination";
import React, { useRef, useState } from "react";
import CardMarkupTableCell from "./CardMarkupTableCell";
import GlobalTable from "../GlobalTable";
import Pagination from "@/component/Pagination";
import { settings } from "@/component/servicesApi/apiCalls/markupSettings/settings";
import MarkupSettingModal from "./MarkupSettingModal";
import CardMarkupModal from "./CardMarkupModal";

const INPUT_SEARCH = [
    { name: "payment_method", label: "Payment Method" },
    { name: "mdr", label: "MDR Rate" },
    { name: "cli_rate", label: "CLI Rate" },
    { name: "withholding_tax", label: "Withholding Tax" },
    { name: "gateway_rate", label: "Gateway Rate" },
];
const CardMarkupFee = () => {
    const [selectedData, setSelectedData] = useState(null);
    const settingsRef = useRef(null);
    const { cardMarkupDetails, setCardMarkupDetails } = useTransactionContext();
    const { handlePageClick, getData } = usePagination(
        settings.retrieveCardMarkupDetails,
        cardMarkupDetails,
        setCardMarkupDetails
    );

    const columns = [
        {
            header: "Payment Method",
            accessor: "payment_method",
            render: (row) => (
                <CardMarkupTableCell type="payment_method" row={row} />
            ),
        },
        {
            header: "MDR Rate",
            accessor: "mdr",
            render: (row) => <CardMarkupTableCell type="mdr" row={row} />,
        },
        {
            header: "CLI Rate",
            accessor: "cli_rate",
            render: (row) => <CardMarkupTableCell type="cli_rate" row={row} />,
        },
        {
            header: "Withholding Tax",
            accessor: "withholding_tax",
            render: (row) => (
                <CardMarkupTableCell type="withholding_tax" row={row} />
            ),
        },
        {
            header: "Gateway Rate",
            accessor: "gateway_rate",
            render: (row) => (
                <CardMarkupTableCell type="gateway_rate" row={row} />
            ),
        },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <CardMarkupTableCell
                    type="actions"
                    row={row}
                    setSelectedData={setSelectedData}
                    settingsRef={settingsRef}
                />
            ),
        },
    ];
    return (
        <>
            <GlobalTable
                columns={columns}
                data={cardMarkupDetails.data}
                loading={cardMarkupDetails.loading}
            />

            <div className="flex justify-end mt-4">
                <div className="flex w-full justify-end mt-3 mb-10">
                    <Pagination
                        currentPage={cardMarkupDetails.currentPage}
                        totalPages={cardMarkupDetails.totalPages}
                        onPageChange={(page) => handlePageClick(page)}
                    />
                </div>
            </div>
            <div>
                <CardMarkupModal
                    settingsRef={settingsRef}
                    fields={INPUT_SEARCH}
                    refetchData={getData}
                    selectedData={selectedData}
                />
            </div>
        </>
    );
};

export default CardMarkupFee;
