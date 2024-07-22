import { useState, useEffect, createContext } from 'react';

export const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (message) => {
            console.log('Received:', message.data);
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

    const sendSocketMessage = (message) => {
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
            socket.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <SocketContext.Provider value={{ sendSocketMessage }}>
            {children}
        </SocketContext.Provider>
    );
};