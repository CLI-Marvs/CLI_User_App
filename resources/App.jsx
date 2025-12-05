import React, { Component, Suspense, lazy } from "react";
import {
    Outlet,
    RouterProvider,
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import DasboardView from "./DasboardView";
const LoginView = lazy(() => import("./component/views/pages/loginViews/LoginView"));
import "@/css/font.css";
import "@/css/style.css";
import Sidebar from "./component/layout/mainComponent/Sidebar";
import Navbar from "./component/layout/mainComponent/Navbar";
import InquiryList from "./layout/inquirypage/InquiryList";
import InquiryListView from "./component/views/pages/raiseaconcernViews/InquiryListView";
import InquiryThreadView from "./component/views/pages/raiseaconcernViews/InquiryThreadView";
import CallBackView from "./component/views/pages/callback/CallBackView";
import ReportViews from "./component/views/pages/raiseaconcernViews/ReportViews";
import WalkinView from "@/component/views/pages/walkinEmojiViews/WalkinView";
import PropertyAndPricingLayout from "./component/views/layout/PropertyAndPricingLayout";
import PricingMasterListView from "./component/views/pages/PropertyAndPricingViews/PricingMasterListView";
import WorkFlowNotificationView from "./component/views/pages/PropertyAndPricingViews/WorkFlowNotificationView";
import BasicPricingView from "./component/views/pages/PropertyAndPricingViews/BasicPricingView";
import PaymentSchemeView from "./component/views/pages/PropertyAndPricingViews/PaymentSchemeView";
import PriceVersioningView from "./component/views/pages/PropertyAndPricingViews/PriceVersioningView";
import PromotionalPricingView from "./component/views/pages/PropertyAndPricingViews/PromotionalPricingView";
import NotificationView from "./component/views/pages/notificationViews/NotificationView";
import FileViewer from "./component/views/pages/fileView/FileViewer";
import AdminSettingView from "./component/views/pages/adminsettingsViews/AdminSettingView";
import BankStatementView from "./component/views/pages/transactionViews/BankStatementView";
import AutoAssignView from "./component/views/pages/raiseaconcernViews/AutoAssignView";
import UserRightsAndPermissionsView from "./component/views/pages/userrightsandpermissionsViews/UserRightsAndPermissionsView";
import PropertySettingViews from "@/component/views/pages/propertySettingViews/propertySettingView";
import BranchSetting from "@/component/layout/inquirypage/BranchSetting";

import FallbackLoader from "./component/FallbackLoader";
import PreloadWrapper from "./component/PreloadWrapper";
import BannerSettingsView from "./component/views/pages/bannersettingsViews/BannerSettingsView";
import CrsSettingsSidebar from "./component/layout/mainComponent/sidebars/CrsSettingsSidebar";
import VersionLogsView from "./component/views/pages/raiseaconcernViews/VersionLogsView";
import { useStateContext } from "./context/contextprovider";

import TransactionSidebar from "./layout/transaction/TransactionSidebar";
import InvoicesView from "@/component/views/pages/transactionViews/InvoicesView";
import TransactionView from "./component/views/pages/transactionViews/TransactionView";
import AutoPostingView from "./component/views/pages/transactionViews/AutoPostingView";
import ErrorPage from "@/component/ErrorElement/ErrorPage";
import MarkupSettingsView from "@/component/views/pages/transactionViews/MarkupSettingsView";
import ReportsView from "./component/views/pages/transactionViews/ReportsView";
import AccountMasterView from "./component/views/pages/titlingAndRegistration/MasterListView";
import WorkOrderView from "./component/views/pages/titlingAndRegistration/WorkOrderView";
import MyWorkOrderView from "./component/views/pages/titlingAndRegistration/MyWorkOrders";
import ExecutiveDashboardView from "./component/views/pages/titlingAndRegistration/ExecutiveDashboardView";
import SettingsView from "./component/views/pages/titlingAndRegistration/SettingsView";
import DocumentManagementSidebar from "./component/layout/mainComponent/sidebars/DocumentManagementSidebar";
import TakenOutAccountView from "./component/views/pages/titlingAndRegistration/TakenOutAccountView";
import FileManagerView from "./component/views/pages/titlingAndRegistration/FileManagerView";
import WalkinTransactionHistoryView from "@/component/views/pages/walkinEmojiViews/WalkinTransactionHistoryView";
import WalkinReportPage from "@/component/layout/inquirypage/WalkinReportPage";
import FinancialToolsView from "./component/views/pages/transactionViews/FinancialToolsView";
import CheckStreamReportsView from "./component/views/pages/transactionViews/CheckStreamReportsView";
import SurveyReportsView from "./component/views/pages/surveyrelatedreportsViews/SurveyReportsView";
import SurveyMainView from "./component/views/pages/surveyrelatedreportsViews/SurveyMainView";
import SurveyReviewView from "./component/views/pages/surveyrelatedreportsViews/SurveyReviewView";
import SurveyMainReportView from "./component/views/pages/surveyrelatedreportsViews/SurveyMainReportView";
import SurveySummaryView from "./component/views/pages/surveyrelatedreportsViews/SurveySummaryView";
import AdminSettingsView from "./component/views/pages/transactionViews/AdminSettingsView";
import TransactionViewLogs from "./component/views/pages/transactionViews/TransactionViewLogs";

// PrivateRoute component to check authentication and permissions( department and employee )
const PrivateRoute = ({ requiredPermission, adminOnly, children }) => {
    const { hasPermission, user } = useStateContext();

    // Check for authentication token
    const authToken = localStorage.getItem("authToken");

    // Admin check
    const isAdmin =
        user &&
        (user.email === "metoh@cebulandmasters.com" ||
            user.employee_email === "metoh@cebulandmasters.com");

    // Redirect to login page if not authenticated
    if (!authToken) {
        return <Navigate to="/" replace />;
    }

    // Restrict to admin only if needed
    if (adminOnly && !isAdmin) {
        return (
            <Navigate
                to="/documentmanagement/titleandregistration/masterlist"
                replace
            />
        );
    }

    // Check for required permissions
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="w-full h-full flex justify-center text-custom-bluegreen text-lg">
                You do not have permission to view this page.
            </div>
        );
    }

    // Render the child routes if authentication and permission checks pass
    return children ? children : <Outlet />;
};

const App = () => {
    /**
     * Implement storage event listener to handle authToken changes across tabs
     */
    useEffect(() => {
        //Listen to localStorage changes in other tabs
        const handleStorageChange = (event) => {
            if (event.key === "authToken" && event.newValue === null) {
                window.location.href = "/";
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const Layout = () => {
        return (
            <div className="bg-white relative max-h-screen flex flex-col h-screen">
                <Navbar />
                <div className="relative flex flex-1 overflow-hidden z-30">
                    <Sidebar />
                    <div className="flex-1 overflow-y-auto bg-custom-grayFA z-20">
                        <Outlet />
                    </div>
                </div>
            </div>
        );
    };

    const SecondLayout = () => {
        return (
            <>
                <div className="flex bg-white relative h-full">
                    <div className="fixed h-full z-20">
                        <CrsSettingsSidebar />
                    </div>
                    <div className="relative flex-1 ml-[230px] z-10">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    };

    const DocumentManagementSidebarLayout = () => {
        return (
            <>
                <div className="flex bg-white relative h-full">
                    <div className="fixed h-full z-50">
                        <DocumentManagementSidebar />
                    </div>
                    <div className="relative flex-1 ml-[230px] z-10">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    };

    const TransactionLayout = () => {
        return (
            <>
                <div className="flex relative overflow-x-hidden min-h-screen bg-custom-grayFA">
                    <div className="w-[210px] h-full fixed z-10">
                        <TransactionSidebar />
                    </div>

                    <div className="ml-[200px] flex-1 overflow-y-auto">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <Suspense fallback={<FallbackLoader />}>
                    <PreloadWrapper resources={["/Images/Imagebg.webp"]}>
                        <LoginView />
                    </PreloadWrapper>
                </Suspense>
            ),
        },
        {
            path: "/login",
            element: (
                <Suspense fallback={<FallbackLoader />}>
                    <PreloadWrapper resources={["/Images/Imagebg.webp"]}>
                        <LoginView />
                    </PreloadWrapper>
                </Suspense>
            ),
        },
        {
            path: "/callback",
            element: <CallBackView />,
        },

        {
            path: "/",
            element: <PrivateRoute />, // Protected routes wrapper
            children: [
                {
                    path: "/",
                    element: <Layout />,
                    children: [
                        {
                            path: "notification",
                            element: (
                                <PrivateRoute requiredPermission="Notification" />
                            ),
                            children: [
                                { path: "", element: <NotificationView /> },
                            ],
                        },
                        {
                            path: "transaction",
                            element: (
                                <PrivateRoute requiredPermission="Transaction Management" />
                            ),
                            children: [
                                {
                                    path: "bank-monitoring",
                                    element: <TransactionLayout />,
                                    children: [
                                        {
                                            path: "bank-statements",
                                            element: <BankStatementView />,
                                        },
                                    ],
                                },
                                {
                                    path: "receivables",
                                    element: <TransactionLayout />,
                                    children: [
                                        {
                                            path: "invoices",
                                            element: <InvoicesView />,
                                        },
                                        {
                                            path: "transactions",
                                            element: <TransactionView />,
                                        },
                                        {
                                            path: "posting",
                                            element: <AutoPostingView />,
                                        },
                                        {
                                            path: "reports",
                                            element: <ReportsView />,
                                        },
                                    ],
                                },
                                {
                                    path: "settings",
                                    element: <TransactionLayout />,
                                    children: [
                                        {
                                            path: "markup",
                                            element: <MarkupSettingsView />,
                                        },
                                        {
                                            path: "version-logs",
                                            element: <TransactionViewLogs />,
                                        },
                                    ],
                                },
                                {
                                    path: "tools",
                                    element: <TransactionLayout />,
                                    children: [
                                        {
                                            path: "check-generator/check-writer",
                                            element: <FinancialToolsView />,
                                        },
                                        {
                                            path: "check-generator/reports",
                                            element: <CheckStreamReportsView />,
                                        },
                                        {
                                            path: "check-generator/admin-settings",
                                            element: <AdminSettingsView />,
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            path: "inquirymanagement",
                            element: (
                                <PrivateRoute requiredPermission="Inquiry Management" />
                            ),
                            children: [
                                {
                                    path: "inquirylist",
                                    element: <InquiryListView />,
                                },
                                {
                                    path: "inquirylist/:filter",
                                    element: <InquiryListView />,
                                },
                                {
                                    path: "thread/:id",
                                    element: <InquiryThreadView />,
                                },
                                {
                                    path: "report/inquiries",
                                    element: <ReportViews />,
                                },
                                {
                                    path: "report/walk-in",
                                    element: <WalkinReportPage />,
                                },
                                {
                                    path: "report/survey",
                                    element: <SurveyMainReportView />,
                                },
                                {
                                    path: "report/survey/:id?",
                                    element: <SurveySummaryView />,
                                },
                                {
                                    path: "walk-in",
                                    element: <WalkinView />,
                                    children: [
                                        {
                                            path: "history",
                                            element: (
                                                <WalkinTransactionHistoryView />
                                            ),
                                        },
                                    ],
                                },
                                {
                                    path: "autoassign",
                                    element: <AutoAssignView />,
                                },
                                {
                                    path: "settings",
                                    element: <SecondLayout />,
                                    children: [
                                        {
                                            path: "autoassign",
                                            element: <AutoAssignView />,
                                        },
                                        {
                                            path: "surveysettings",
                                            element: <SurveyReportsView />,
                                        },
                                        {
                                            path: "surveysettings/surveyform",
                                            element: <SurveyMainView />,
                                        },
                                        {
                                            path: "surveysettings/surveyform/:id?",
                                            element: <SurveyMainView />,
                                        },
                                        {
                                            path: "surveysettings/surveyreview",
                                            element: <SurveyReviewView />,
                                        },
                                        {
                                            path: "bannersettings",
                                            element: <BannerSettingsView />,
                                        },
                                        {
                                            path: "branch-settings",
                                            element: <BranchSetting />,
                                        },
                                        {
                                            path: "versionlogs",
                                            element: <VersionLogsView />,
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            path: "documentmanagement",
                        },
                        {
                            path: "documentmanagement/titleandregistration",
                            element: <DocumentManagementSidebarLayout />,
                            children: [
                                {
                                    path: "masterlist",
                                    element: <AccountMasterView />,
                                },
                                {
                                    path: "workorders",
                                    element: (
                                        <WorkOrderView />
                                    ),
                                },
                                {
                                    path: "myworkorders",
                                    element: <MyWorkOrderView />,
                                },
                                {
                                    path: "executivedashboard",
                                    element: (
                                        <ExecutiveDashboardView />
                                    ),
                                },
                                {
                                    path: "settings",
                                    element: (
                                        <SettingsView />
                                    ),
                                },
                                {
                                    path: "takenoutaccounts",
                                    element: <TakenOutAccountView />,
                                },
                                {
                                    path: "filemanager",
                                    element: (
                                        <FileManagerView />
                                    ),
                                },
                            ],
                        },
                        {
                            path: "property-pricing",
                            element: (
                                <PrivateRoute requiredPermission="Property Pricing">
                                    <PropertyAndPricingLayout />
                                </PrivateRoute>
                            ),
                            children: [
                                {
                                    path: "workflow-notification",
                                    element: <WorkFlowNotificationView />,
                                },
                                {
                                    path: "master-lists",
                                    element: <PricingMasterListView />,
                                },
                                {
                                    path: "basic-pricing/:id",
                                    element: <BasicPricingView />,
                                },
                                {
                                    path: "payment-scheme",
                                    element: <PaymentSchemeView />,
                                },
                                {
                                    path: "price-versioning",
                                    element: <PriceVersioningView />,
                                },
                                {
                                    path: "promotional-pricing",
                                    element: <PromotionalPricingView />,
                                },
                            ],
                        },

                        {
                            path: "adminsettings",
                            element: <AdminSettingView />,
                        },
                        {
                            path: "super-admin",
                            // element: (
                            //     <PrivateRoute requiredPermission="Super Admin">
                            //         <SuperAdminLayout />
                            //     </PrivateRoute>
                            // ),
                            children: [
                                {
                                    path: "user-rights-and-permissions",
                                    element: <UserRightsAndPermissionsView />,
                                },
                                {
                                    path: "property-settings",
                                    element: <PropertySettingViews />,
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        {
            path: "/file-viewer/attachment/:id",
            element: <PrivateRoute />,
            children: [
                {
                    path: "/file-viewer/attachment/:id",
                    element: <FileViewer />,
                },
            ],
        },

        {
            path: "*",
            element: <ErrorPage />,
        },
    ]);

    return <RouterProvider router={router} />;
};
export default App;
