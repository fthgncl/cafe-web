import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { apiSocketAddress } from '../config';
import { AccountContext } from './AccountContext';

export const SocketContext = createContext(undefined);

const RECONNECT_DELAY = 3000;

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketData, setSocketData] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const { accountProps, updateToken } = useContext(AccountContext);

    // Mesaj kuyruğu referansı
    const messageQueueRef = useRef([]);
    const intervalRef = useRef(null);

    const createSocket = () => {
        const ws = new WebSocket(apiSocketAddress);

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);

            if (data) {
                if (data.type === 'updateToken') {
                    updateToken(data.message);
                } else {
                    messageQueueRef.current.push(data); // Kuyruğa ekle
                }
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setTimeout(createSocket, RECONNECT_DELAY);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);
    };

    // Kuyruğu işleyen zamanlayıcı
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            if (messageQueueRef.current.length > 0) {
                const nextMessage = messageQueueRef.current.shift();
                setSocketData(nextMessage);
            }
        }, 1000); // Her 1 saniyede bir mesaj işle

        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        createSocket();

        return () => {
            if (socket) {
                setIsConnected(false);
                socket.close();
            }
        };
        // eslint-disable-next-line
    }, []);


    // Veriyi bir kere işledikten sonra temizle
    useEffect(() => {
        if (Object.keys(socketData).length > 0) {
            const timeout = setTimeout(() => {
                setSocketData({});
            }, 500); // Kısa bir süre sonra veriyi temizle
            return () => clearTimeout(timeout);
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
