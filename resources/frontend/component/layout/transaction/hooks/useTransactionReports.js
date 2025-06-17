import { transaction } from '@/component/servicesApi/apiCalls/transactions';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

export const useTransactionReports = ({ activeTab, dateRange }) => {
    const startDate = moment(dateRange[0]?.startDate).format("YYYY-MM-DD");
    const endDate = moment(dateRange[0]?.endDate).format("YYYY-MM-DD");

    return useQuery({
        queryKey: ['reportData', activeTab, startDate, endDate],
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
