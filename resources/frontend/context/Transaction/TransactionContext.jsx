import React, {
    createContext,
    useContext,
    useState,
} from "react";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [postingList, setPostingList] = useState([]);
    const [currentPagePosting, setCurrentPagePosting] = useState(0);
    const [totalPagePosting, setTotalPagePosting] = useState(0);
    const [activeItemTransaction, setActiveItemTransaction] = useState("Cleared");
    
    const [transactions, setTransactions] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {}
    });

   /*  const [postings, setPostings] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {}
    }); */

    const [invoices, setInvoices] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {}
    });

    return (
        <TransactionContext.Provider
            value={{
                postingList,
                setPostingList,
                currentPagePosting,
                setCurrentPagePosting,
                totalPagePosting,
                setTotalPagePosting,
                activeItemTransaction,
                setActiveItemTransaction,
                transactions, 
                setTransactions,
                invoices, 
                setInvoices
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};



export const useTransactionContext = () => useContext(TransactionContext);

