import { Outlet } from "react-router-dom";
import { UserProvider } from "./components/UserContext";

export default function App() {
    return (
        <UserProvider>
            <Outlet />
        </UserProvider>
    );
}
