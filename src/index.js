import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {SocketProvider} from "./context/SocketContext";
import {AccountProvider} from "./context/AccountContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AccountProvider>
        <SocketProvider>
            <App/>
        </SocketProvider>
    </AccountProvider>
);
