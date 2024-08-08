
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import DasboardView from "../views/Dashboard/DasboardView";

const App = () => {

    const router = createBrowserRouter([
        {
            path: "/",
            element: <DasboardView />,
        },

    ]);

    return <RouterProvider router={router} />;
};

export default App;
