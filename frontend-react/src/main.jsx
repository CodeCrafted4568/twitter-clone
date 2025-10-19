import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import { UserProvider } from "./components/UserContext.jsx";

const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/login", element: <Login /> },
    { path: "/home", element: <Home /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <UserProvider>
            <RouterProvider router={router} />
        </UserProvider>
    </React.StrictMode>
);
