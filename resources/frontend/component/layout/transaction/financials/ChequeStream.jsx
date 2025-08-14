import React, { useEffect, useMemo, useState } from "react";
import ChequeSettings from "./ChequeSettings";
import PrintableChecks from "./PrintableChecks";
import CheckPreviewHeader from "./CheckPreviewHeader";
import Pagination from "./Pagination";
import CheckCard from "./CheckCard";
import { showToast } from "@/util/toastUtil";
import { useChequeSelection } from "../hooks/useChequeSelection";
import { useChequeConfirmation } from "../hooks/useChequeConfirmation";
import { useChequeData } from "../hooks/useChequeData";
import { generateMonthlyDates } from "../utils/chequeUtils";
import { requiredKeys } from "../constant/requiredKeys";

const ChequeStream = () => {
    const { data, setData, handleCheck } = useChequeData();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [reprintMode, setReprintMode] = useState(false);
    const [reprintIndex, setReprintIndex] = useState(null);

    const checkDates = useMemo(() => {
        if (!data.startDate || data.totalChecks <= 0) return [];
        return generateMonthlyDates(data.startDate, data.totalChecks);
    }, [data.startDate, data.totalChecks]);

    const getCheckNos = (index) => {
        const override = data.checkNos?.[index];
        if (override && override.trim() !== "") return override;
        if (data.checkBaseNo) {
            const baseStr = data.checkBaseNo.toString();
            const baseNo = parseInt(baseStr, 10);
            const nextNo = baseNo + index + 1;
            return nextNo.toString().padStart(baseStr.length, "0");
        }
        return "";
    };

    const {
        confirmIndex,
        confirmedChecks,
        setConfirmedChecks,
        isConfirmAll,
        isSavePending,
        confirmCheck,
        confirmAll,
    } = useChequeConfirmation(data, checkDates, getCheckNos);

    const {
        selectedChecks,
        setSelectedChecks,
        allSelected,
        toggleSelectAll,
        updateSelection,
    } = useChequeSelection(checkDates, confirmedChecks);

    const handlePrintSelected = () => {
        if (selectedChecks.length === 0) {
            showToast("Please select at least one check to print.", "info");
            return;
        }
        resetReprintMode();
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const resetReprintMode = () => {
        setReprintMode(false);
        setReprintIndex(null);
    };

    const handleReprint = (index) => {
        setReprintMode(true);
        setReprintIndex(index);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleConfirmAll = () => {
        confirmAll(selectedChecks, setSelectedChecks, () => {});
    };

    const endDate =
        checkDates.length > 0
            ? checkDates[checkDates.length - 1].toISOString().split("T")[0]
            : "";

    const unconfirmedChecksWithIndices = checkDates
        .map((date, originalIndex) => ({ date, originalIndex }))
        .filter((item) => !confirmedChecks.includes(item.originalIndex));

    const totalPages = Math.ceil(
        unconfirmedChecksWithIndices.length / rowsPerPage
    );
    const paginatedUnconfirmedChecks = unconfirmedChecksWithIndices.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const isError = useMemo(() => {
        const allFieldsFilled = requiredKeys.every(
            (key) => data[key]?.toString().trim() !== ""
        );
        const isContractValid = data.contract_number?.toString().length === 13;
        return allFieldsFilled && isContractValid;
    }, [data]);

    useEffect(() => {
        setConfirmedChecks([]);
        setCurrentPage(1);
    }, [data.totalChecks, data.startDate, data.checkBaseNo]);

    useEffect(() => {
        const unconfirmedCount = unconfirmedChecksWithIndices.length;
        const maxPages = Math.ceil(unconfirmedCount / rowsPerPage);
        if (currentPage > maxPages && maxPages > 0) {
            setCurrentPage(maxPages);
        }
    }, [unconfirmedChecksWithIndices.length, rowsPerPage, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [checkDates]);

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            <ChequeSettings
                handleCheck={handleCheck}
                data={data}
                setData={setData}
                endDate={endDate}
            />

            <div
                className="relative bg-white print:shadow-none p-5 print-container"
                style={{ position: "relative" }}
            >
                <PrintableChecks
                    checkDates={checkDates}
                    data={data}
                    selectedChecks={selectedChecks}
                    confirmedChecks={confirmedChecks}
                    reprintMode={reprintMode}
                    reprintIndex={reprintIndex}
                />

                {checkDates.length > 0 && isError && (
                    <div className="print:hidden">
                        <CheckPreviewHeader
                            unconfirmedCount={
                                unconfirmedChecksWithIndices.length
                            }
                            allSelected={allSelected}
                            onToggleSelectAll={toggleSelectAll}
                            onPrintSelected={handlePrintSelected}
                            onConfirmAll={handleConfirmAll}
                            isConfirmAll={isConfirmAll}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            rowsPerPage={rowsPerPage}
                            onPageChange={setCurrentPage}
                            onRowsPerPageChange={(value) => {
                                setRowsPerPage(value);
                                setCurrentPage(1);
                            }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 px-6">
                            {paginatedUnconfirmedChecks.map((checkInfo) => (
                                <CheckCard
                                    key={checkInfo.originalIndex}
                                    checkInfo={checkInfo}
                                    data={data}
                                    selectedChecks={selectedChecks}
                                    confirmIndex={confirmIndex}
                                    isSavePending={isSavePending}
                                    getCheckNos={getCheckNos}
                                    onSelectionChange={updateSelection}
                                    onCheckNumberChange={(index, value) =>
                                        handleCheck("checkNos", value, index)
                                    }
                                    onConfirm={confirmCheck}
                                    onReprint={handleReprint}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChequeStream;
