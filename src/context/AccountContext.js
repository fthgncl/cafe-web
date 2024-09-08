import {createContext, useEffect, useRef, useState} from 'react';
import {localStorageAccountName} from "../config";

export const AccountContext = createContext(undefined);

export const AccountProvider = ({ children }) => {
    const [accountProps, setAccountProps] = useState({});
    const [isActive, setIsActive] = useState(false);
    const timeoutRef = useRef(null);

    const updateToken = (newProps) => {

        let storedAccountProps;
        try {
            storedAccountProps = JSON.parse(localStorage.getItem(localStorageAccountName));
        } catch (error) {
            console.error("JSON parsing error in updateToken:", error);
            return;
        }

        if (typeof storedAccountProps === 'object' && storedAccountProps !== null) {
            const updatedProps = { ...storedAccountProps, ...newProps };
            updateAccountProps(updatedProps);
        } else {
            console.warn("Stored account props is not an object or is null");
        }
    };


    useEffect(() => {
        const storedAccountProps = localStorage.getItem(localStorageAccountName);

        if (storedAccountProps) {
            try {
                const parsedProps = JSON.parse(storedAccountProps);
                if (parsedProps.tokenLifeTime && parsedProps.tokenLifeTime > 0) {
                    setAccountProps(parsedProps);
                    setIsActive(true);

                    timeoutRef.current = setTimeout(logout, parsedProps.tokenLifeTime);
                } else {
                    console.warn("Session expired.");
                    logout();
                }
            } catch (error) {
                console.error("JSON parsing error:", error);
                logout();
            }
        }

        // Cleanup function to clear the timeout when the component unmounts
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const updateAccountProps = (newAccountProps) => {
        localStorage.setItem(localStorageAccountName, JSON.stringify(newAccountProps));
        setAccountProps(newAccountProps);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(logout, newAccountProps.tokenLifeTime);

        setIsActive(true);
    };

    const logout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        localStorage.removeItem(localStorageAccountName);
        setIsActive(false);
        setAccountProps({});
    };


    function checkPermissions(nesesarryPermissions, fullMatch = false) {
        // Kullanıcının sahip olduğu yetkiler
        const userPermissions = accountProps.permissions || "";

        if ( userPermissions.includes('a'))
            return true;

        // Gereken yetkileri bir diziye ayır
        const requiredPermissions = nesesarryPermissions.split("");

        if (fullMatch) {
            // Tüm yetkilerin bulunup bulunmadığını kontrol et
            return requiredPermissions.every(permission => userPermissions.includes(permission));
        } else {
            // Herhangi bir yetkinin bulunup bulunmadığını kontrol et
            return requiredPermissions.some(permission => userPermissions.includes(permission));
        }
    }

    return (
        <AccountContext.Provider
            value={{accountProps, setAccountProps: updateAccountProps, logout, isActive, checkPermissions, updateToken}}>
            {children}
        </AccountContext.Provider>
    );
};
