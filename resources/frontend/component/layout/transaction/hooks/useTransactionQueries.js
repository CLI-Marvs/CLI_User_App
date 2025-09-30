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
    });
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

export const useCreateBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => transaction.createCheckStreamBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-banks"]);
        },
    });
};

export const useUpdateBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            transaction.updateCheckStreamBank(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-banks"]);
        },
    });
};

export const useDeleteBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => transaction.deleteCheckStreamBank(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-banks"]);
        },
    });
};

export const useCheckStreamBanks = () => {
    return useQuery({
        queryKey: ["check-stream-banks"],
        queryFn: async () => {
            return await transaction.retrieveCheckStreamBanks();
        },
    });
};

export const useCheckEntities = () => {
    return useQuery({
        queryKey: ["check-stream-entities"],
        queryFn: async () => {
            return await transaction.retrieveCheckEntities();
        },
    });
};

export const useCreateEntity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => transaction.createCheckEntity(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-entities"]);
        },
    });
};

export const useUpdateEntity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            transaction.updateCheckStreamEntity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-entities"]);
        },
    });
};

export const useDeleteEntity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => transaction.deleteCheckStreamEntity(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-entities"]);
        },
    });
};

export const useSaveChecks = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            return await transaction.storePrintedCheck(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
    });
};

export const useChecksExport = () => {
    return useMutation({
        mutationFn: async ({ data }) => {
            return await transaction.exportChecks(data);
        },
    });
};

export const useCheckStreamAdminSettings = () => {
    return useQuery({
        queryKey: ["check-stream-admin-settings"],
        queryFn: async () => {
            return await transaction.retrieveCheckStreamAdminSettings();
        },
    });
};

export const useCreateCheckStreamAdminSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => transaction.createCheckStreamAdminSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-admin-settings"]);
        },
    });
};

export const useUpdateCheckStreamAdminSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            transaction.updateCheckStreamAdminSettings(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-admin-settings"]);
        },
    });
};

export const useDeleteCheckStreamAdminSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => transaction.deleteCheckStreamAdminSettings(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["check-stream-admin-settings"]);
        },
    });
};