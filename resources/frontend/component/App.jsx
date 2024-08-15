
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
                            element: <InquiryList/>,
                        },
                    ],
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
