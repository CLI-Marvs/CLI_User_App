import React, { Component, Suspense, lazy } from "react";
import {
    Outlet,
    RouterProvider,
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import DasboardView from "../views/Dashboard/DasboardView";
const LoginView = lazy(() => import("./views/pages/loginViews/LoginView"));
import CLILoader from "../../../public/Images/CLI-Logo-Loading-Screen.gif";
import "./layout/css/font.css";
import "./layout/css/style.css";
import Home from "./layout/Home";
import Sidebar from "./layout/mainComponent/Sidebar";
import Navbar from "./layout/mainComponent/Navbar";
import InquiryList from "./layout/inquirypage/InquiryList";
import InquiryListView from "./views/pages/raiseaconcernViews/InquiryListView";
import InquiryThreadView from "./views/pages/raiseaconcernViews/InquiryThreadView";
import CallBackView from "./views/pages/callback/CallBackView";
import ReportViews from "./views/pages/raiseaconcernViews/ReportViews";
import PropertyAndPricingLayout from "./views/layout/PropertyAndPricingLayout";
import PricingMasterListView from "./views/pages/PropertyAndPricingViews/PricingMasterListView";
import WorkFlowNotificationView from "./views/pages/PropertyAndPricingViews/WorkFlowNotificationView";
import BasicPricingView from "./views/pages/PropertyAndPricingViews/BasicPricingView";
import PaymentSchemeView from "./views/pages/PropertyAndPricingViews/PaymentSchemeView";
import PriceVersioningView from "./views/pages/PropertyAndPricingViews/PriceVersioningView";
import PromotionalPricingView from "./views/pages/PropertyAndPricingViews/PromotionalPricingView";
import NotificationView from "./views/pages/notificationViews/NotificationView";
import FileViewer from "../component/views/pages/fileView/FileViewer";
import SalesManagementLayout from "./views/layout/SalesManagementLayout";
import ReservationListView from "./views/pages/salesViews/ReservationListView";
import ReservationPageView from "./views/pages/salesViews/ReservationPageView";
import PaymentMainView from "./views/pages/paymentViews/PaymentMainView";
import PaymentSectionView from "./views/pages/paymentViews/PaymentSectionView";
import MainComponent from "./layout/chatComponent/MainComponent";
import AdminSettingView from "./views/pages/adminsettingsViews/AdminSettingView";
import BankStatementView from "./views/pages/transactionViews/BankStatementView";
import AutoAssignView from "./views/pages/raiseaconcernViews/AutoAssignView";
import UserRightsAndPermissionsView from "./views/pages/userrightsandpermissionsViews/UserRightsAndPermissionsView";
import PropertySettingViews from "@/component/views/pages/propertySettingViews/propertySettingView";
import FallbackLoader from "./FallbackLoader";
import PreloadWrapper from "./PreloadWrapper";
import BannerSettingsView from "./views/pages/bannersettingsViews/BannerSettingsView";
import CrsSettingsSidebar from "./layout/mainComponent/sidebars/CrsSettingsSidebar";
import VersionLogsView from "./views/pages/raiseaconcernViews/VersionLogsView";
import { useStateContext } from "../context/contextprovider";
import { ALLOWED_EMPLOYEES_CRS } from "../constant/data/allowedEmployeesCRS";
import CustomerMasterListView from "@/component/views/pages/transactionViews/CustomerMasterListView";
import CustomerDetailsView from "@/component/views/pages/transactionViews/CustomerDetailsView";
import TransactionSidebar from "./layout/transaction/TransactionSidebar";
import InvoicesView from "@/component/views/pages/transactionViews/InvoicesView";
import TransactionView from "./views/pages/transactionViews/TransactionView";
import AutoPostingView from "./views/pages/transactionViews/AutoPostingView";
import ErrorPage from "@/component/ErrorElement/ErrorPage";
import MarkupSettingsView from "@/component/views/pages/transactionViews/MarkupSettingsView";
import ReportsView from "./views/pages/transactionViews/ReportsView";
import AccountMasterView from "./views/pages/titlingAndRegistration/MasterListView";
import WorkOrderView from "./views/pages/titlingAndRegistration/WorkOrderView";
import MyWorkOrderView from "./views/pages/titlingAndRegistration/MyWorkOrders";
import ExecutiveDashboardView from "./views/pages/titlingAndRegistration/ExecutiveDashboardView";
import SettingsView from "./views/pages/titlingAndRegistration/SettingsView";
import DocumentManagementSidebar from "./layout/mainComponent/sidebars/DocumentManagementSidebar";
import TakenOutAccountView from "./views/pages/titlingAndRegistration/TakenOutAccountView";

// PrivateRoute component to check authentication and permissions( department and employee )
const PrivateRoute = ({ requiredPermission, children }) => {
    const { hasPermission } = useStateContext();

    // Check for authentication token
    const authToken = localStorage.getItem("authToken");

    // Redirect to login page if not authenticated
    if (!authToken) {
        return <Navigate to="/" replace />;
    }

    // Check for required permissions
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="w-full h-full flex justify-center   text-custom-bluegreen text-lg">
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
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 overflow-y-auto bg-custom-grayFA ">
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
                    <div className="fixed h-full z-50">
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
            path: "/chatbox",
            element: <MainComponent />,
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
                            path: "home",
                            element: <Home />,
                        },
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
                                    path: "thread/:id",
                                    element: <InquiryThreadView />,
                                },
                                {
                                    path: "report",
                                    element: <ReportViews />,
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
                                            path: "bannersettings",
                                            element: <BannerSettingsView />,
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
                                    element: <WorkOrderView />,
                                },
                                {
                                    path: "myworkorders",
                                    element: <MyWorkOrderView />,
                                },
                                {
                                    path: "executivedashboard",
                                    element: <ExecutiveDashboardView />,
                                },
                                {
                                    path: "settings",
                                    element: <SettingsView />,
                                },
                                {
                                    path: "takenoutaccounts",
                                    element: <TakenOutAccountView />,
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
                            path: "sales",
                            element: (
                                <PrivateRoute requiredPermission="Sales Management" />
                            ),
                            children: [
                                {
                                    path: "customer",
                                    element: <CustomerMasterListView />,
                                },
                                {
                                    path: "details/:id",
                                    element: <CustomerDetailsView />,
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
            path: "/paymentmethod",
            element: <PaymentMainView />,
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
            path: "/paymentmethod/payonlinenow",
            element: <PaymentSectionView />,
        },
        {
            path: "*",
            element: <ErrorPage />,
        },
    ]);

    return <RouterProvider router={router} />;
};
export default App;
