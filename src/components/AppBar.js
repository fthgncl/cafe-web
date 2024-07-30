import {useContext, useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import {cafeName} from '../config';
import {AccountContext} from "../context/AccountContext";


export default function MenuAppBar() {

    const {accountProps, logout} = useContext(AccountContext);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogOut = () => {
        logout();
    };

    return (
        <Box id='AppBar' sx={{flexGrow: 1}}>
            <AppBar position="static" sx={{boxShadow: 'none', borderBottomLeftRadius: 30, borderBottomRightRadius: 30}}>
                <Toolbar>
                    <Typography onClick={() => window.location.href = '/'} variant="h6" component="div"
                                sx={{flexGrow: 1, cursor: 'pointer'}}>
                        {cafeName}
                    </Typography>
                    <IconButton
                        sx={{borderRadius: 3}}
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Typography variant="h6" component="div"
                                    sx={{flexGrow: 2, marginRight: 2, fontSize: 15}}>
                            {accountProps.username}
                        </Typography>
                        <AccountCircle/>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {/*<MenuItem onClick={() => window.location.href = '/account'}>Hesap</MenuItem>*/}
                        {/*{roles.length !== 0 && (*/}
                        {/*    <MenuItem onClick={() => window.location.href = '/admin-dashboard'}>Yönetici*/}
                        {/*        Paneli</MenuItem>)}*/}
                        {/*<MenuItem onClick={() => window.location.href = '/dashboard'}>Kontrol Paneli</MenuItem>*/}
                        <MenuItem onClick={handleLogOut}>Oturumu Kapat</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
