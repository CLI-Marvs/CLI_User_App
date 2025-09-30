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
    const [banks, setBanks] = useState([]);
    const [enabled, setEnabled] = useState(false);
    const [defaultColumns, setDefaultColumns] = useState([]);
    
    const [transactions, setTransactions] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,
    });

    const [bankStatementsList, setBankStatementsList] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,

    });

    const [invoices, setInvoices] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,
    });

    const [markupSettings, setMarkupSettings] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,
    });

     const [cardMarkupDetails, setCardMarkupDetails] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,
    });

    const [printedChecks, setPrintedChecks] = useState({
        data: [],
        currentPage: 0,
        totalPages: 0,
        filters: {},
        loading: true,
        totalCheckAmount: 0,
        totalRecords: 0
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
                setInvoices,
                bankStatementsList,
                setBankStatementsList,
                markupSettings,
                setMarkupSettings,
                cardMarkupDetails,
                setCardMarkupDetails,
                banks,
                setBanks,
                enabled,
                setEnabled,
                defaultColumns,
                setDefaultColumns,
                printedChecks,
                setPrintedChecks
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};



export const useTransactionContext = () => useContext(TransactionContext);

