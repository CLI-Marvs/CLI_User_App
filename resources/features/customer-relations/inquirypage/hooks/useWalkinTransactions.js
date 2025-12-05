import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { walkinTransactionService } from "@/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { queueService } from "@/servicesApi/apiCalls/emojiWalkin/queueService";
import { showToast } from "@/util/toastUtil";

export function useWalkinTransactions({
    page,
    pageSize,
    selectedBranch,
    selectedDesk,
}) {
    const queryClient = useQueryClient();

    // Restore walk-in status if the user will reload the page
    useEffect(() => {
        const restoreWalkinStatus = async () => {
            const engagedId = localStorage.getItem("engagedWalkinId");
            if (engagedId) {
                await walkinTransactionService.updateWalkinTransactionStatus({
                    walkin_transaction_id: engagedId,
                    status: "queue",
                });
                localStorage.removeItem("engagedWalkinId");
                queryClient.invalidateQueries({
                    queryKey: ["queueWalkinTransactions", page],
                });
            }
        };
        restoreWalkinStatus();
    }, []);

    // Query for walk-in transactions
    const walkinQuery = useQuery({
        queryKey: ["queueWalkinTransactions", page, selectedBranch.slug],
        queryFn: () => {
            if (!selectedBranch.slug) return Promise.resolve(undefined);
            return walkinTransactionService.getQueuedWalkinTransactions(
                page,
                pageSize,
                selectedBranch.slug
            );
        },
        enabled: !!selectedBranch.slug,
        keepPreviousData: true,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
        refetchInterval: 10000,
    });

    // Mutation for engaging a transaction
    const engageMutation = useMutation({
        mutationFn: async (item) => {
            if (!selectedBranch.id) {
                showToast("Please select a branch first.", "warning");
                throw new Error("No branch selected");
            }
            if (!selectedDesk.id) {
                showToast("Please select a desk/counter first.", "warning");
                throw new Error("No desk selected");
            }
            await walkinTransactionService.updateWalkinTransactionStatus({
                walkin_transaction_id: item?.id,
                status: "serving",
            });

            // Send to queue monitor - firebase
            const payload = {
                priority_number: item?.priority_number,
                status: "serving",
                counter: selectedDesk?.name,
            };
            queueService.updateQueueStatus(payload);

            // Invalidate the query to refresh the list
            queryClient.invalidateQueries({
                queryKey: [
                    "queueWalkinTransactions",
                    page,
                    selectedBranch.slug,
                ],
            });
        },
    });

    return { ...walkinQuery, engageMutation };
}
