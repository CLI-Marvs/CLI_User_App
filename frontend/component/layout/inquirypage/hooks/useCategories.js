import { useQuery } from "@tanstack/react-query";
import { categoryService } from "frontend/component/servicesApi/apiCalls/emojiWalkin/categoryService";

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getAllCategories(),
        staleTime: 1000 * 60, // 1 minute
        cacheTime: 1000 * 60 * 5, // 5 minutes
    });
};
