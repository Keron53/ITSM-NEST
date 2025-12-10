import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Read API_URL from config or fallback, then extract just the host/port for socket
        // If API_URL is http://localhost:3000/api/v1, we need http://localhost:3000
        const apiUrl = window.APP_CONFIG?.API_URL || 'http://localhost:3000/api/v1';

        // Simple URL parsing to get the root URL for socket.io
        let socketUrl = apiUrl;
        try {
            const url = new URL(apiUrl);
            socketUrl = `${url.protocol}//${url.host}`;
        } catch (e) {
            console.error("Invalid API URL for socket:", apiUrl);
        }

        const newSocket = io(socketUrl, {
            transports: ['websocket'], // Force WebSocket transport
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
