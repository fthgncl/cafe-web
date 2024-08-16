import { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreateUser from "./pages/CreateUser";
import CreateProduct from "./pages/CreateProduct";
import OrderEntry from "./pages/OrderEntry";
import NotConnected from "./pages/NotConnected";
import { AccountContext } from "./context/AccountContext";
import { SocketContext } from "./context/SocketContext";
import AppBar from "./components/AppBar";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    const { isConnected } = useContext(SocketContext);
    const { isActive } = useContext(AccountContext);
    const [isSocketChecked, setIsSocketChecked] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSocketChecked(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isConnected) {
        if (!isSocketChecked) {
            return <div/>;
        }

        return <NotConnected />;
    }

    if (!isActive) {
        return <LoginPage />;
    } else {
        return (
            <>
                <AppBar />
                <Routes>
                    <Route path="/" element={<HomePage/>} />

                    <Route path="/create-user" element={<PrivateRoute
                        element={<CreateUser />}
                        requiredPermissions=""
                        fullMatch={false}
                    />} />

                    <Route path="/create-product" element={<PrivateRoute
                        element={<CreateProduct />}
                        requiredPermissions="b"
                        fullMatch={false}
                    />} />

                    <Route path="/order-entry" element={<PrivateRoute
                        element={<OrderEntry />}
                        requiredPermissions="d"
                        fullMatch={false}
                    />} />
                </Routes>
            </>
        );
    }
}

export default App;
