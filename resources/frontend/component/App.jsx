
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import DasboardView from "../views/Dashboard/DasboardView";
import LoginView from "./views/pages/loginViews/LoginView";
import './layout/css/font.css'
import './layout/css/style.css'
import Home from "./layout/Home";
import Sidebar from "./layout/mainComponent/Sidebar";
import Navbar from "./layout/mainComponent/Navbar";
import InquiryManagementLayout from "./views/layout/InquiryManagementLayout";
import InquiryList from "./layout/inquirypage/InquiryList";
import InquiryListView from "./views/pages/raiseaconcernViews/InquiryListView";
import InquiryThreadView from "./views/pages/raiseaconcernViews/InquiryThreadView";
import CallBackView from "./views/pages/callback/CallBackView";
import ReportViews from "./views/pages/raiseaconcernViews/ReportViews";
const App = () => {

    const Layout = () => {
        return (
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
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginView/>,
        },
        {
            path: "/login",
            element: <LoginView/>,
        }, 

        {
            path: "/callback",
            element: <CallBackView/>,
        },
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "home",
                    element:<Home/>,
                },
                {
                    path: "inquirymanagement",
                    element: <InquiryManagementLayout/>,
                    children: [
                        {
                            path: "inquirylist",
                            element: <InquiryListView/>,
                        },
                        {
                            path: "thread/:id",
                            element: <InquiryThreadView/>,
                        },
                        {
                            path: "report",
                            element: <ReportViews/>,
                        },
                    ],
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
