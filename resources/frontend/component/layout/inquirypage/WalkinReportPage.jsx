import React, { useState, useMemo, useRef } from "react";
import { HeaderAndFilters } from "@/component/layout/inquirypage/component/WalkinReport/HeaderAndFilters";
import SummaryCards from "@/component/layout/inquirypage/component/WalkinReport/SummaryCards";
import ChartSection from "@/component/layout/inquirypage/component/WalkinReport/ChartSection";
import FeedbackTabs from "@/component/layout/inquirypage/component/WalkinReport/FeedbackTabs";
import { useBranch } from "@/component/layout/inquirypage/hooks/useBranch";
import { useQuery } from "@tanstack/react-query";
import { personTypeService } from "@/component/servicesApi/apiCalls/emojiWalkin/personTypeService";
import { reportService } from "@/component/servicesApi/apiCalls/emojiWalkin/reportService";
import emojis from "@/component/layout/inquirypage/constants/emoji";
import WalkinReportSkeleton from "@/component/layout/inquirypage/component/WalkinReport/skeleton/WalkinReportSkeleton";
import { useWalkinReportFilters } from "@/context/InquiryManagement/WalkinReportFilterProvider";

 
const WalkinReportPage = () => {
    const { filters, setFilters, resetFilters } = useWalkinReportFilters();
    const isFirstLoad = useRef(true);
    const { data: personTypes } = useQuery({
        queryKey: ["personTypes"],
        queryFn: personTypeService.getAllPersonTypes,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
    });
    const { data: reportsData, isLoading } = useQuery({
        queryKey: ["reports", filters],
        queryFn: () => reportService.getReports(filters),
        refetchOnWindowFocus: false,
        enabled: !!filters,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
        onSuccess: () => {
            isFirstLoad.current = false;
        },
    });
    const { data: branchesData } = useBranch();

    //Event handlers
    const handleApply = (pendingFilters) => {
        setFilters(pendingFilters);
    };

    // const handleReset = () => {
    //     setFilters(DEFAULT_FILTERS);
    // };

    //Derive analytics/value from reportsData
    //Anaytics object to be used in SummaryCards
    const analytics = useMemo(() => {
        if (!reportsData?.data) {
            return {
                overallAverage: 0,
                totalQueueFeedback: 0,
                totalStandaloneFeedback: 0,
            };
        }
        return {
            overallAverage: isNaN(Number(reportsData.data?.total_avg))
                ? "0.0"
                : Number(reportsData.data.total_avg).toFixed(1),
            totalQueueFeedback: reportsData.data?.queue_linked_count ?? 0,
            totalStandaloneFeedback: reportsData.data?.standalone_count ?? 0,
        };
    }, [reportsData]);

    // Feedback data for table and charts
    // This will be used in FeedbackTabs and ChartSection
    const feedbackData = useMemo(() => {
        if (
            !reportsData?.data ||
            !Array.isArray(reportsData.data.queue_linked) ||
            !Array.isArray(reportsData.data.standalone)
        ) {
            return { queueLinked: [], standalone: [] };
        }

        // Helper to get emoji object by rating
        const getEmojiObj = (rating) =>
            emojis.find((e) => e.rating === Number(rating)) || {};

        // Map queue-linked feedback
        const queueLinked = (reportsData.data.queue_linked || []).map(
            (item) => {
                const emojiObj = getEmojiObj(item.user_rating);
                return {
                    id: item.id,
                    priorityNumber: item.priority_number || item.id,
                    branch:
                        branchesData?.find((b) => b.id === item.branch_id)
                            ?.name || item.branch_id,
                    personType:
                        personTypes?.find((p) => p.id === item.person_type_id)
                            ?.name || item.person_type_id,
                    priority: item?.priority_level ?? "",
                    emoji:
                        emojiObj?.src && emojiObj?.satifaction_name ? (
                            <img
                                src={emojiObj.src}
                                alt={emojiObj.satifaction_name}
                                className="w-6 h-6 inline"
                            />
                        ) : null,
                    rating: item.user_rating ?? "",
                    timestamp:
                        typeof item?.created_at === "string"
                            ? item.created_at.slice(0, 19).replace("T", " ")
                            : "",
                };
            }
        );

        // Map stand-alone feedback
        const standalone = (reportsData.data.standalone || []).map((item) => {
            const emojiObj = getEmojiObj(item?.rating_value);
            return {
                id: item?.id ?? "",
                branch:
                    branchesData?.find((b) => b.id === item?.branch_id)?.name ||
                    item?.branch_id ||
                    "",
                emoji:
                    emojiObj?.src && emojiObj?.satifaction_name ? (
                        <img
                            src={emojiObj.src}
                            alt={emojiObj.satifaction_name}
                            className="w-6 h-6 inline"
                        />
                    ) : null,
                rating: item?.rating_value ?? "",
                timestamp:
                    typeof item?.created_at === "string"
                        ? item.created_at.slice(0, 19).replace("T", " ")
                        : "",
            };
        });

        return { queueLinked, standalone };
    }, [reportsData, branchesData, personTypes]);

    // Chart data for visualizations
    const chartAnalytics = useMemo(() => {
        const queueLinked = Array.isArray(feedbackData?.queueLinked)
            ? feedbackData.queueLinked
            : [];
        const standalone = Array.isArray(feedbackData?.standalone)
            ? feedbackData.standalone
            : [];

        if (!queueLinked.length && !standalone.length) {
            return {
                customerTypeData: [],
                branchData: [],
            };
        }

        const customerTypeCounts = {};
        queueLinked.forEach((fb) => {
            if (!fb?.personType) return;
            customerTypeCounts[fb.personType] =
                (customerTypeCounts[fb.personType] || 0) + 1;
        });
        const customerTypeData = Object.entries(customerTypeCounts).map(
            ([name, value]) => ({
                name,
                value,
            })
        );

        const branchRatings = {};
        [...queueLinked, ...standalone].forEach((fb) => {
            if (!fb?.branch) return;
            if (!branchRatings[fb.branch]) branchRatings[fb.branch] = [];
            branchRatings[fb.branch].push(Number(fb.rating) || 0);
        });
        const branchData = Object.entries(branchRatings).map(
            ([name, ratings]) => ({
                name,
                average: ratings.length
                    ? (
                          ratings.reduce((sum, r) => sum + r, 0) /
                          ratings.length
                      ).toFixed(1)
                    : "0.0",
                count: ratings.length,
            })
        );
        return {
            customerTypeData,
            branchData,
        };
    }, [feedbackData]);

    if (isLoading && isFirstLoad.current) {
        return <WalkinReportSkeleton />;
    }

    return (
        <div className="min-h-screen bg-custombg p-6">
            <div className="  mx-auto space-y-6">
                <HeaderAndFilters
                    filters={filters}
                    onApply={handleApply}
                    onReset={resetFilters}
                    branchesData={branchesData}
                    personTypes={personTypes}
                    emojis={emojis}
                />
                <SummaryCards analytics={analytics || []} />
                <ChartSection analytics={chartAnalytics} emojis={emojis} />
                <FeedbackTabs filteredData={feedbackData} />
            </div>
        </div>
    );
};

export default WalkinReportPage;
