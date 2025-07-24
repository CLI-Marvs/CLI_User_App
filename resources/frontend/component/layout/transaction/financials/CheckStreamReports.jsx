import React, { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";

import { useStateContext } from "@/context/contextprovider";
import GlobalTable from "../GlobalTable";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import usePagination from "@/hooks/usePagination";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import Pagination from "@/component/Pagination";
import CheckTableCell from "./CheckTableCell";
import { useChecksExport } from "../hooks/useTransactionQueries";
import Export from "@/component/shared/components/Export";
import { showToast } from "@/util/toastUtil";
import CheckStreamModal from "./CheckStreamModal";
import { formatCurrency } from "@/util/formatCurrency";
import Alert from "@/component/Alert";

const CheckStreamReports = () => {
    const { canWrite } = useStateContext();
    const [selectedData, setSelectedData] = useState(null);
    const [dataToDelete, setDataToDelete] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const settingsRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const fields = [
        { name: "check_number", label: "Check Number" },
        { name: "date_range", type: "date_range", label: "Check Date" },
        { name: "printed_date", type: "printed_date", label: "Printed Date" },
    ];

    const columns = [
        {
            header: "Check Number",
            accessor: "check_no",
            render: (row) => <CheckTableCell type="check_no" row={row} />,
        },
        {
            header: "Check Amount",
            accessor: "check_amount",
            render: (row) => <CheckTableCell type="check_amount" row={row} />,
        },
        {
            header: "Check Date",
            accessor: "check_date",
            render: (row) => <CheckTableCell type="check_date" row={row} />,
        },
        {
            header: "Payor Name",
            accessor: "payor_name",
            render: (row) => <CheckTableCell type="payor_name" row={row} />,
        },
        {
            header: "Drawee Bank",
            accessor: "bank_name",
            render: (row) => <CheckTableCell type="bank_name" row={row} />,
        },
        {
            header: "Beneficiary Name",
            accessor: "beneficiary_name",
            render: (row) => (
                <CheckTableCell type="beneficiary_name" row={row} />
            ),
        },
        {
            header: "Remarks",
            accessor: "remarks",
            render: (row) => <CheckTableCell type="remarks" row={row} />,
        },
        ...(canWrite("Transaction Management")
            ? [
                  {
                      header: "Actions",
                      accessor: "actions",
                      render: (row) => (
                          <CheckTableCell
                              type="actions"
                              row={row}
                              setSelectedData={setSelectedData}
                              settingsRef={settingsRef}
                              setShowAlert={setShowAlert}
                              setDataToDelete={setDataToDelete}
                          />
                      ),
                  },
              ]
            : []),
    ];

    const [searchValues, setSearchValues] = useState({});
    const { printedChecks, setPrintedChecks } = useTransactionContext();
    const { handlePageClick, setFilters, getData } = usePagination(
        transaction.retrievePrintedChecks,
        printedChecks,
        setPrintedChecks
    );

    const { mutateAsync: exxportChecks, isPending: isExporting } =
        useChecksExport();

    const exportToExcel = async () => {
        try {
            if(printedChecks?.data.length === 0) return showToast("No data to export", "info");
            const payload = {
                filter: printedChecks?.filters,
            };

            const response = await exxportChecks({ data: payload });

            if (response.status !== 200)
                return showToast("Export failed", "error");

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Printed Checks.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("Exported successfully", "success");
        } catch (error) {
            showToast("Export failed. Please try again later.", "error");
        }
    };
    const handleSearchValue = (e) => {
        const { name, value } = e.target;
        setSearchValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmit = () => {
        setFilters(searchValues);
        setSearchValues({});
    };

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            await transaction.deletePrintedCheck(dataToDelete);
            showToast("Successfully deleted", "success");
            setTimeout(() => {
                getData();
            }, 1000);
        } catch (error) {
            setShowAlert(false);
            setIsLoading(false);
            showToast("Delete failed. Please try again later.", "error");
            console.log("error", error);
        } finally {
            setIsLoading(false);
            setShowAlert(false);
        }
    };

    const handleCancel = () => {
        setShowAlert(false);
    };

    return (
        <>
            <div className="flex flex-col space-y-2 w-full">
                <div className="flex flex-row items-center">
                    <TransactionSearchBar
                        fields={fields}
                        searchValues={searchValues}
                        setSearchValues={setSearchValues}
                        onChangeSearch={handleSearchValue}
                        onSubmit={onSubmit}
                        setFilters={setFilters}
                    />
                    <Export
                        isExporting={isExporting}
                        exportToExcel={exportToExcel}
                    />
                </div>

                <div className="flex px-2 gap-3 montserrat-regular">
                    <span>Total Records:</span>
                    <span className="text-custom-lightgreen font-semibold">
                        {printedChecks.totalRecords}
                    </span>
                    <span>Total Check Amount:</span>
                    <span className="text-custom-lightgreen font-semibold">
                        {formatCurrency(printedChecks.totalCheckAmount)}
                    </span>
                </div>

                <GlobalTable
                    columns={columns}
                    data={printedChecks.data}
                    loading={printedChecks.loading}
                />
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <Pagination
                            currentPage={printedChecks.currentPage}
                            totalPages={printedChecks.totalPages}
                            onPageChange={(page) => handlePageClick(page)}
                        />
                    </div>
                </div>
            </div>

            <CheckStreamModal
                settingsRef={settingsRef}
                refetchData={getData}
                selectedData={selectedData}
            />

            <Alert
                title="Are you sure you want to delete this data?"
                show={showAlert}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                isLoading={isLoading}
            />
        </>
    );
};

export default CheckStreamReports;
