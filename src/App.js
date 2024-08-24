import {useState, useEffect, useContext} from 'react';
import {Routes, Route} from 'react-router-dom';
import AdminDashBoardPage from "./pages/AdminDashBoardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrderEntry from "./pages/OrderEntry";
import OrdersPage from "./pages/OrdersPage";
import NotConnected from "./pages/NotConnected";
import {AccountContext} from "./context/AccountContext";
import {SocketContext} from "./context/SocketContext";
import AppBar from "./components/AppBar";
import AuthorizedComponent from "./components/AuthorizedComponent";

function App() {
    const {isConnected, socketData} = useContext(SocketContext);
    const {isActive, logout, accountProps} = useContext(AccountContext);
    const [isSocketChecked, setIsSocketChecked] = useState(false);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if (socketData.type === 'updateUser') {
            if (socketData.message.status === "success" && socketData.message.updatedUser) {
                if (socketData.message.updatedUser.username === accountProps.username) {
                    logout();
                }
            }

        }

        // eslint-disable-next-line
    }, [socketData]);

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

        return <NotConnected/>;
    }

    if (!isActive) {
        return <LoginPage/>;
    } else {
        return (
            <>
                <AppBar/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>

                    <Route path="/order-entry" element={<AuthorizedComponent
                        element={<OrderEntry/>}
                        requiredPermissions="d"
                        fullMatch={false}
                    />}/>

                    <Route path="/orders" element={<AuthorizedComponent
                        element={<OrdersPage/>}
                        requiredPermissions="defg"
                        fullMatch={false}
                    />}/>

                    <Route path="/admin-dashboard" element={<AuthorizedComponent
                        element={<AdminDashBoardPage/>}
                        requiredPermissions="bc"
                        fullMatch={false}
                    />}/>
                </Routes>
            </>
        );
    }
}

export default App;
