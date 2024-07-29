import {Routes, Route} from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import CreateUser from "./pages/CreateUser";
import CreateProduct from "./pages/CreateProduct";
import OrderEntry from "./pages/OrderEntry";
import {useContext} from "react";
import {AccountContext} from "./context/AccountContext";
import AppBar from "./components/AppBar";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    const {isActive} = useContext(AccountContext);

    if (!isActive) {
        return <LoginPage/>;
    } else return (
        <>
            <AppBar/>
            <Routes>
                <Route path="/" element={<div/>}/>

                <Route path="/create-user" element={<PrivateRoute
                    element={<CreateUser/>}
                    requiredPermissions="a"
                    fullMatch={false}
                />}/>

                <Route path="/create-product" element={<PrivateRoute
                    element={<CreateProduct/>}
                    requiredPermissions="ab"
                    fullMatch={false}
                />}/>

                <Route path="/order-entry" element={<PrivateRoute
                    element={<OrderEntry/>}
                    requiredPermissions="ad"
                    fullMatch={false}
                />}/>

            </Routes>
        </>
    );
}

export default App;
