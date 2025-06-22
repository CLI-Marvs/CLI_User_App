import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";

export const useColumns = (subFeatureId) => {
    return useQuery({
        queryKey: ["columns", subFeatureId],
        queryFn: async () => {
            return await transaction.retrieveColumns({ subFeatureId });
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!subFeatureId,
    });
};

export const useSubFeatureId = (name) => {
    return useQuery({
        queryKey: [name],
        queryFn: async () => {
            return await transaction.retrieveSubFeatureId({ name });
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!name,
    });
};

export const useSaveView = (subFeatureId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ selectedFields, viewName }) => {
            return await transaction.storeViewAndColumns({
                subFeatureId,
                columns: Object.keys(selectedFields).map((key) => ({
                    column_name: key,
                })),
                name: viewName,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["columns", subFeatureId]);
        },
    });
};


export const useTransactionsExport = () => {
    return useMutation({
        mutationFn: async ({ data }) => {
            return await transaction.exportTransactions(data);
        },
    })
};

export const useSetDefaultView = (subFeatureId, setHasManuallySelected) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ presetId, selectedFields, viewName }) =>
            await transaction.setDefaultView({
                subFeatureId,
                presetId,
                columns: Object.keys(selectedFields).map((key) => ({
                    column_name: key,
                })),
                name: viewName,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(["columns", subFeatureId]);
            setHasManuallySelected?.(false);
        },
    });
};

export const useTransactionReports = ({ activeTab, dateRange }) => {
    const startDate = moment(dateRange[0]?.startDate).format("YYYY-MM-DD");
    const endDate = moment(dateRange[0]?.endDate).format("YYYY-MM-DD");

    return useQuery({
        queryKey: ["reportData", activeTab, startDate, endDate],
        queryFn: async () => {
            return await transaction.transactionReports({
                start_date: startDate,
                end_date: endDate,
                payment_option: activeTab,
            });
        },
        keepPreviousData: true,
    });
};


