import { useQuery } from "@tanstack/react-query";
import { branchService } from "frontend/component/servicesApi/apiCalls/emojiWalkin/branchService";

export const useBranch = () => {
    return useQuery({
        queryKey: ["branches"],
        queryFn: () => branchService.getAllBranches(),
        staleTime: 1000 * 60, // 1 minute
        cacheTime: 1000 * 60 * 5, // 5 minutes
    });
};
