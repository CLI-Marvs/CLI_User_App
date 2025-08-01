import React, { useState, useEffect } from "react";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { paginate } from "@/component/layout/inquirypage/component/utils/paginate";

const FeedbackTabs = ({ filteredData, filters, activeTab, setActiveTab }) => {
    //States
    const [standalonePage, setStandalonePage] = useState(1);
    const [queuePage, setQueuePage] = useState(1);
    const perPage = 5;

    //Hooks
   //Manual switching of tabs
    useEffect(() => {
        if (activeTab === "queue-linked") setQueuePage(1);
        if (activeTab === "standalone") setStandalonePage(1);
        // eslint-disable-next-line
    }, [activeTab]);

    //Dynamic switching of tabs based on filters
    useEffect(() => {
        if (
            filters?.sourceType === "Stand-alone" &&
            activeTab !== "standalone"
        ) {
            setActiveTab("standalone");
        } else {
            setActiveTab("queue-linked");
        }
    }, [filters?.sourceType]);

    // Config object for tabs
    const tabConfig = {
        "queue-linked": {
            data: filteredData.queueLinked,
            page: queuePage,
            setPage: setQueuePage,
            total: filteredData.queueLinked?.length || 0,
        },
        standalone: {
            data: filteredData.standalone,
            page: standalonePage,
            setPage: setStandalonePage,
            total: filteredData.standalone?.length || 0,
        },
    };

    // Use config for current tab
    const currentTab = tabConfig[activeTab];
    const totalPages = Math.ceil(currentTab.total / perPage);
    const paginatedData = paginate(currentTab.data, {
        page: currentTab.page,
        pageSize: perPage,
    });

    return (
        <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex space-x-2 bg-custom-lightestgreen rounded-md p-1 w-fit">
                <button
                    className={`px-4 py-2 rounded text-sm montserrat-medium ${
                        activeTab === "queue-linked"
                            ? "bg-custom-solidgreen text-white"
                            : "text-custom-gray71"
                    }`}
                    onClick={() => setActiveTab("queue-linked")}
                >
                    Queue-linked Feedback
                </button>
                <button
                    className={`px-4 py-2 rounded text-sm montserrat-medium ${
                        activeTab === "standalone"
                            ? "bg-custom-solidgreen text-white"
                            : "text-custom-gray71"
                    }`}
                    onClick={() => setActiveTab("standalone")}
                >
                    Stand-alone Feedback
                </button>
            </div>

            {/* Queue-linked Table */}
            {activeTab === "queue-linked" && (
                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-x-auto">
                    <div className="bg-custom-tablebg px-4 py-3 border-b">
                        <h2 className="text-lg montserrat-semibold text-custom-bluegreen">
                            Queue-linked Feedback Details
                        </h2>
                    </div>
                    <table className="min-w-full text-sm">
                        <thead className="bg-custom-lightestgreen">
                            <tr>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Priority Number
                                </th>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Branch
                                </th>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Person Type
                                </th>

                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Rate
                                </th>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Timestamp
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-lightestgreen">
                            {paginatedData &&
                                paginatedData?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-custombg3"
                                    >
                                        <td className="px-6 py-4 montserrat-regular">
                                            {item.priorityNumber}
                                        </td>
                                        <td className="px-6 py-4 text-custom-gray71 montserrat-regular">
                                            {item.branch}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 text-xs border rounded text-custom-solidgreen border-custom-lightgreen montserrat-regular">
                                                {item.personType}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">
                                                    {item.emoji}
                                                </span>
                                                {/* <span className="text-sm text-custom-gray71 montserrat-regular">
                                                ({item.rating}/5)
                                            </span> */}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-custom-gray71 montserrat-regular">
                                            {item.timestamp}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stand-alone Table */}
            {activeTab === "standalone" && (
                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-x-auto">
                    <div className="bg-custom-tablebg px-4 py-3 border-b">
                        <h2 className="text-lg montserrat-semibold text-custom-bluegreen">
                            Stand-alone Feedback Details
                        </h2>
                    </div>
                    <table className="min-w-full text-sm">
                        <thead className="bg-custom-lightestgreen">
                            <tr>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Branch
                                </th>

                                <th className="text-left px-10 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Rate
                                </th>
                                <th className="text-left px-6 py-3 montserrat-semibold text-custom-gray12 uppercase">
                                    Timestamp
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-lightestgreen">
                            {paginatedData &&
                                paginatedData?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-custombg3"
                                    >
                                        <td className="px-6 py-4 text-custom-gray71">
                                            {item.branch}
                                        </td>

                                        <td className="px-10 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">
                                                    {item.emoji}
                                                </span>
                                                {/* <span className="text-sm text-custom-gray71">
                                                ({item.rating}/5)
                                            </span> */}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-custom-gray71">
                                            {item.timestamp}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-end mt-4 px-4">
                <Pagination
                    pageCount={totalPages}
                    currentPage={currentTab.page}
                    onPageChange={currentTab.setPage}
                />
            </div>
        </div>
    );
};

export default FeedbackTabs;
