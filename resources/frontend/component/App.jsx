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
import TransactionView from "./views/pages/transactionViews/TransactionView";
import TransactionSidebar from "./views/pages/transactionViews/TransactionSidebar";
import BankStatementView from "./views/pages/transactionViews/BankStatementView";
import AutoAssignView from "./views/pages/raiseaconcernViews/AutoAssignView";
import UserRightsAndPermissionsView from "./views/pages/userrightsandpermissionsViews/UserRightsAndPermissionsView";
import FallbackLoader from "./FallbackLoader";
import PreloadWrapper from "./PreloadWrapper";
import BannerSettingsView from "./views/pages/bannersettingsViews/BannerSettingsView";
import CrsSettingsSidebar from "./layout/mainComponent/sidebars/CrsSettingsSidebar";
import VersionLogsView from "./views/pages/raiseaconcernViews/VersionLogsView";
import { useStateContext } from "../context/contextprovider";
import { ALLOWED_EMPLOYEES_CRS } from "../constant/data/allowedEmployeesCRS";
import CustomerMasterListView from "@/component/views/pages/transactionViews/CustomerMasterListView";
import CustomerDetailsView from "@/component/views/pages/transactionViews/CustomerDetailsView";

// PrivateRoute component to check authentication and permissions( department and employee )
const PrivateRoute = ({ requiredPermission }) => {
    const { hasPermission, user } = useStateContext();
    const userLoggedInEmail = user?.employee_email;

    // Check for authentication token
    const authToken = localStorage.getItem("authToken");

    // Redirect to login page if not authenticated
    if (!authToken) {
        return <Navigate to="/" replace />;
    }

    // //Check if logged in user is allowed to view the superadmin page
    // if (!ALLOWED_EMPLOYEES_CRS.includes(userLoggedInEmail)) {
    //     return (
    //         <div className="w-full h-full flex justify-center   text-custom-bluegreen text-lg mt-4">
    //             You do not have permission to view this page.
    //         </div>
    //     );
    // }

    // Check for required permissions
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="w-full h-full flex justify-center   text-custom-bluegreen text-lg">
                You do not have permission to view this page.
            </div>
        );
    }

    // Render the child routes if authentication and permission checks pass
    return <Outlet />;
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
                                    path: "invoices",
                                    element: <TransactionView />,
                                },
                                {
                                    path: "records",
                                    element: <BankStatementView />,
                                },
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
                            //TODO: add permission here
                            path: "property-pricing",
                            element: <PropertyAndPricingLayout />,
                            children: [
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
                            path: "salesmanagement",
                            element: <SalesManagementLayout />,
                            children: [
                                {
                                    path: "reservationlist",
                                    element: <ReservationListView />,
                                },
                                {
                                    path: "reservationpage",
                                    element: <ReservationPageView />,
                                },
                            ],
                        },
                        {
                            path: "adminsettings",
                            element: <AdminSettingView />,
                        },
                        {
                            path: "super-admin/user-rights-and-permissions",
                            element: <UserRightsAndPermissionsView />,
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
    ]);

    return <RouterProvider router={router} />;
};

export default App;
