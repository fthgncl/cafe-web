import { useContext } from 'react';
import Unauthorized from "../pages/Unauthorized";
import { AccountContext } from '../context/AccountContext';

const PrivateRoute = ({ element, requiredPermissions, fullMatch }) => {
    const { checkPermissions } = useContext(AccountContext);
    const hasPermission = checkPermissions(requiredPermissions, fullMatch);

    if (hasPermission) {
        return element;
    } else {
        return (<Unauthorized/>)
    }
};

export default PrivateRoute;
