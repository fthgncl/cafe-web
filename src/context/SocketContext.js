import {useState, useEffect, createContext, useContext} from 'react';
import {apiSocketAddress} from '../config';
import {AccountContext} from "./AccountContext";

export const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketData, setSocketData] = useState({});
    const {accountProps} = useContext(AccountContext);

    useEffect(() => {
        const ws = new WebSocket(apiSocketAddress);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (message) => {
            console.log(JSON.parse(message.data));
            setSocketData(JSON.parse(message.data))
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        return () => { // Cleanup on unmount
            ws.close();
        };

    }, []);

    const sendSocketMessage = (message,type) => {
        if (!socket) {
            console.error('WebSocket instance is not available');
            return;
        }
        if (socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }
        if (typeof message !== 'object' || message === null) {
            console.error('Message must be a JSON object');
            return;
        }
        try {
            const token = accountProps.token
            socket.send(JSON.stringify({type,message,token}));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <SocketContext.Provider value={{ sendSocketMessage ,socketData }}>
            {children}
        </SocketContext.Provider>
    );
};