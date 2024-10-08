import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import DasboardView from "../views/Dashboard/DasboardView";
import LoginView from "./views/pages/loginViews/LoginView";
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

import SalesManagementLayout from "./views/layout/SalesManagementLayout";
import ReservationListView from "./views/pages/salesViews/ReservationListView";
import ReservationPageView from "./views/pages/salesViews/ReservationPageView";
import PaymentMainView from "./views/pages/paymentViews/PaymentMainView";
import PaymentSectionView from "./views/pages/paymentViews/PaymentSectionView";
import MainComponent from "./layout/chatComponent/MainComponent";

const App = () => {
    const Layout = () => {
        return (
            <div className="bg-white relative max-h-screen flex flex-col h-screen">
                <Navbar />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 overflow-y-auto bg-custom-grayFA">
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

    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginView />,
        },
        {
            path: "/login",
            element: <LoginView />,
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
                    path: "inquirymanagement/inquirylist",
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
            ],
        },
        {
            path: "/paymentmethod",
            element: <PaymentMainView />,
        },
        {
            path: "/paymentmethod/payonlinenow",
            element: <PaymentSectionView />,
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
