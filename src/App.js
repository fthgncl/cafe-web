import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import CreateUser from "./pages/CreateUser";
import {useContext, useEffect} from "react";
import { AccountContext } from "./context/AccountContext";
import AppBar from "./components/AppBar";

function App() {
    const { isActive } = useContext(AccountContext);


    if (!isActive) {
        return <LoginPage />;
    }
    else return (
        <>
            <AppBar />
            <Routes>
                <Route path="/" element={<div />} />
                <Route path="/create-user" element={<CreateUser />} />
            </Routes>
        </>
    );
}

export default App;
