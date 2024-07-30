import { useState, useEffect, createContext, useContext } from 'react';
import { apiSocketAddress } from '../config';
import { AccountContext } from "./AccountContext";

export const SocketContext = createContext(undefined);

const RECONNECT_DELAY = 3000;

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketData, setSocketData] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const { accountProps, updateToken } = useContext(AccountContext);

    const createSocket = () => {
        const ws = new WebSocket(apiSocketAddress);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
        };

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);

            if (data) {
                if (data.type === 'updateToken') {
                    updateToken(data.message);
                } else {
                    setSocketData(data);
                }
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket server');
            setTimeout(createSocket, RECONNECT_DELAY); // Bağlantı koparsa yeniden bağlanmayı dene
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);
    };

    useEffect(() => {
        createSocket();

        return () => { // Cleanup on unmount
            if (socket) {
                setIsConnected(false);
                socket.close();
            }
        };



    }, []);

    useEffect(() => {
        const isEmpty = Object.keys(socketData).length === 0 && socketData.constructor === Object;
        if (!isEmpty) {
            setSocketData({});
        }
    }, [socketData]);

    const sendSocketMessage = (message, type) => {
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
            const token = accountProps.token;
            socket.send(JSON.stringify({ type, message, token }));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <SocketContext.Provider value={{ sendSocketMessage, socketData, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
