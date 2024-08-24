import {useContext, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import backGroundImage from '../images/1908-background.png';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import {SocketContext} from "../context/SocketContext";
import {AccountContext} from "../context/AccountContext";
import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";

export default function SignInSide() {

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const {setAccountProps} = useContext(AccountContext);
    const messageType = 'login';
    const navigate = useNavigate();

    useEffect(() => {

        if (socketData && socketData.type === messageType) {
            setIsLoading(false);

            if (socketData.message.success && socketData.message.accountProps) {
                setAccountProps(socketData.message.accountProps);
                navigate('/');
                return;
            }

            setErrorMessage(socketData.message.message);
        }

        // eslint-disable-next-line
    }, [socketData]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const loginData = {
            username: data.get('username'),
            password: data.get('password'),
        };
        setIsLoading(true);
        sendSocketMessage(loginData, messageType);
    };

    return (
        <Grid container component="main" sx={{height: '100vh'}}>
            <CssBaseline/>
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: `url(${backGroundImage})`,
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'left',
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'primary.main'}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Giriş Yap
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Kullanıcı Adı"
                            name="username"
                            autoComplete="username"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"

                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        tabIndex={-1}
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(true)}
                                        onMouseDown={() => setShowPassword(false)}
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }}
                        />
                        <Typography sx={{textAlign: 'center', color: 'error.main'}}
                                    variant='body2'>{errorMessage}</Typography>
                        <Button
                            disabled={isLoading}
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            {isLoading ? <CircularProgress color="inherit"/> : <>Giriş Yap</>}
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}