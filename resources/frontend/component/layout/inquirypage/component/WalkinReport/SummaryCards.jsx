import { Smile, Users, TrendingUp, TabletSmartphone, Star } from "lucide-react";

const SummaryCards = ({ analytics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Average Rating */}
            <div className="bg-white border border-custom-lightgreen rounded-md shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm montserrat-medium text-custom-gray71">
                            Overall Average
                        </p>
                        <p className="text-2xl md:text-3xl montserrat-bold text-custom-solidgreen">
                            {analytics.overallAverage}
                        </p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-custom-lightestgreen rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 md:h-6 md:w-6 text-custom-solidgreen" />
                    </div>
                </div>
            </div>

            {/* Queue-linked Feedback */}
            <div className="bg-white border border-custom-lightblue rounded-md shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs md:text-sm montserrat-medium text-custom-gray71 whitespace-pre-line">
                            Queue-linked Feedback
                        </p>
                        <p className="text-2xl md:text-3xl montserrat-bold text-custom-blue">
                            {analytics.totalQueueFeedback}
                        </p>
                    </div>
                    <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 bg-teal-50 rounded-full flex items-center justify-center aspect-square">
                        <Users className="h-6 w-6 text-custom-blue" />
                    </div>
                </div>
            </div>
            {/* Stand-alone Feedback */}
            <div className="bg-white border border-custom-bluegreen rounded-md shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs md:text-sm montserrat-medium text-custom-gray71 whitespace-pre-line">
                            Stand-alone Feedback
                        </p>
                        <p className="text-2xl md:text-3xl montserrat-bold text-custom-bluegreen">
                            {analytics.totalStandaloneFeedback}
                        </p>
                    </div>
                    <div className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 bg-teal-50 rounded-full flex items-center justify-center aspect-square">
                        <TabletSmartphone className="h-6 w-6 md:h-8 md:w-8 text-custom-bluegreen" />
                    </div>
                </div>
            </div>
            {/* Total Feedback */}
            <div className="bg-white border border-custom-lightgreen rounded-md shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm montserrat-medium text-custom-gray71">
                            Total Feedback
                        </p>
                        <p className="text-3xl montserrat-bold text-custom-solidgreen">
                            {analytics.totalQueueFeedback +
                                analytics.totalStandaloneFeedback}
                        </p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-custom-lightestgreen rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-custom-solidgreen" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;
