import {createContext} from 'react';
import {localStorageAccountName} from "../config";

export const AccountContext = createContext(undefined);

export const AccountProvider = ({ children }) => {

    const accountProps = () => {
        return localStorage.getItem(localStorageAccountName);
    }

    const setAccountProps = (newAccountProps) => {
        return localStorage.setItem(localStorageAccountName, newAccountProps)
    }



    return (
        <AccountContext.Provider value={{ accountProps, setAccountProps }}>
            {children}
        </AccountContext.Provider>
    );
};