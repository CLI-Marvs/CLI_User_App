import React, { Component, Suspense, lazy } from "react";
import {
    Outlet,
    RouterProvider,
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { ContextProvider } from "../context/contextprovider";
// import DasboardView from "../views/Dashboard/DasboardView";
const LoginView = lazy(() => import("./views/pages/loginViews/LoginView"));
// import CLILoader from '../../../public/Images/CLI-Logo-Loading-Screen.gif';
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
import AccountMasterView from "./views/pages/titlingAndRegistration/MasterListView";
import WorkOrderView from "./views/pages/titlingAndRegistration/WorkOrderView";
import ExecutiveDashboardView from "./views/pages/titlingAndRegistration/ExecutiveDashboardView";
import SettingsView from "./views/pages/titlingAndRegistration/SettingsView";
import DocumentManagementSidebar from "./layout/mainComponent/sidebars/DocumentManagementSidebar";
import TakenOutAccountView from "./views/pages/titlingAndRegistration/TakenOutAccountView";

// PrivateRoute component to check authentication
const PrivateRoute = () => {
    const authToken = localStorage.getItem("authToken");
    return authToken ? <Outlet /> : <Navigate to="/" replace />;
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

        /*  return (
            <>
                <div className="bg-white relative max-h-screen flex flex-col">
                    <Navbar/>
                    <div className="flex flex-1 overflow-hidden">
                        <Sidebar/>
                        <div className="flex-1 overflow-y-auto ">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </>
        ); */
    };

    const SecondLayout = () => {
        return (
            <>
                <div className="flex bg-white relative h-full">
                    <div className="fixed h-full z-50">
                        <CrsSettingsSidebar />
                        {/* <DocumentManagementSidebar /> */}
                    </div>
                    <div className="relative flex-1 ml-[230px] z-10">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    };

    const DocumentManagementSidebarLayout = () =>{
        return (
            <>
                <div className="flex bg-white relative h-full">
                    <div className="fixed h-full z-50">
                        {/* <CrsSettingsSidebar /> */}
                        <DocumentManagementSidebar />
                    </div>
                    <div className="relative flex-1 ml-[230px] z-10">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    };

    // const router = createBrowserRouter([
    //     {
    //         path: "/",
    //         element: <LoginView />,
    //     },
    //     {
    //         path: "/login",
    //         element: <LoginView />,
    //     },

    //     {
    //         path: "/callback",
    //         element: <CallBackView />,
    //     },
    //     {
    //         path: "/chatbox",
    //         element: <MainComponent />,
    //     },
    //     {
    //         path: "/",
    //         element: <Layout />,
    //         children: [
    //             {
    //                 path: "home",
    //                 element: <Home />,
    //             },
    //             {
    //                 path: "notification",
    //                 element: <NotificationView />,
    //             },
    //             {
    //                 path: "transactionmanagement/invoices",
    //                 element: <TransactionView />,
    //             },
    //             {
    //                 path: "transactionmanagement/transactionrecords",
    //                 element: <BankStatementView />,
    //             },
    //             /*  {
    //                 path: "transaction",
    //                 element: <SecondLayout />,
    //                 children: [
    //                     {
    //                         path: "invoices",
    //                         element: <TransactionView/>,
    //                     },
    //                     {
    //                         path: "bankstatements",
    //                         element: <BankStatementView/>,
    //                     },
    //                 ],

    //             }, */
    //             {
    //                 path: "inquirymanagement/inquirylist",
    //                 element: <InquiryListView />,
    //             },
    //             {
    //                 path: "inquirymanagement/thread/:id",
    //                 element: <InquiryThreadView />,
    //             },
    //             {
    //                 path: "inquirymanagement/report",
    //                 element: <ReportViews />,
    //             },

    //             {
    //                 path: "propertyandpricing",
    //                 element: <PropertyAndPricingLayout />,
    //                 children: [
    //                     {
    //                         path: "pricingmasterlist",
    //                         element: <PricingMasterListView />,
    //                     },
    //                     {
    //                         path: "basicpricing/:id",
    //                         element: <BasicPricingView />,
    //                     },
    //                     {
    //                         path: "paymentscheme",
    //                         element: <PaymentSchemeView />,
    //                     },
    //                     {
    //                         path: "priceversioning",
    //                         element: <PriceVersioningView />,
    //                     },
    //                     {
    //                         path: "promotionalPricing",
    //                         element: <PromotionalPricingView />,
    //                     },
    //                 ],
    //             },
    //             {
    //                 path: "salesmanagement",
    //                 element: <SalesManagementLayout />,
    //                 children: [
    //                     {
    //                         path: "reservationlist",
    //                         element: <ReservationListView />,
    //                     },
    //                     {
    //                         path: "reservationpage",
    //                         element: <ReservationPageView />,
    //                     },
    //                 ],
    //             },
    //             {
    //                 path: "adminsettings",
    //                 element: <AdminSettingView />,
    //             },
    //         ],
    //     },
    //     {
    //         path: "/paymentmethod",
    //         element: <PaymentMainView />,
    //     },
    //     {
    //         path: "/file-viewer/attachment/:id",
    //         element: <FileViewer />,
    //     },
    //     {
    //         path: "/paymentmethod/payonlinenow",
    //         element: <PaymentSectionView />,
    //     },

    // ]);
    // router.beforeEach((to, from, next) => {
    //     if (to.meta.requiresAuth && !localStorage.getItem("authToken")) {
    //         router.replace({ name: "/" });
    //     } else if (to.meta.requiresAuth && localStorage.getItem("authToken")) {
    //         UserApi.check_authorization().then((callback) => {
    //             if (callback.result) next();
    //         });
    //     } else {
    //         next();
    //     }
    // });
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
                            element: <NotificationView />,
                        },
                        {
                            path: "transactionmanagement/invoices",
                            element: <TransactionView />,
                        },
                        {
                            path: "transactionmanagement/transactionrecords",
                            element: <BankStatementView />,
                        },
                        {
                            path: "inquirymanagement/inquirylist",
                            element: <InquiryListView />,
                        },
                        {
                            path: "inquirymanagement/inquirylist/:filter",
                            element: <InquiryListView />,
                        },
                        {
                            path: "inquirymanagement/thread/:id",
                            element: <InquiryThreadView />,
                        },
                        {
                            path: "inquirymanagement/report",
                            element: <ReportViews />,
                        },
                        {
                            path: "inquirymanagement/autoassign",
                            element: <AutoAssignView />,
                        },
                        {
                            path: "inquirymanagement/settings",
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
                            path: "propertyandpricing",
                            element: <PropertyAndPricingLayout />,
                            children: [
                                {
                                    path: "pricingmasterlist",
                                    element: <PricingMasterListView />,
                                },
                                {
                                    path: "basicpricing/:id",
                                    element: <BasicPricingView />,
                                },
                                {
                                    path: "paymentscheme",
                                    element: <PaymentSchemeView />,
                                },
                                {
                                    path: "priceversioning",
                                    element: <PriceVersioningView />,
                                },
                                {
                                    path: "promotionalPricing",
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
                            path: "superadmin/userrightsandpermissions",
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

    return (
        <ContextProvider> {/* Wrap the entire app with ContextProvider */}
            <RouterProvider router={router} />
        </ContextProvider>
    );
};

export default App;
