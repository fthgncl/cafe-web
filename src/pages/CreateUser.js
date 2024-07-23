import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import {useContext, useEffect, useState} from "react";
import {useFormik} from 'formik';
import {createUserSchema} from "../schemas/createUserSchema";
import {SocketContext} from "../context/SocketContext";

// TODO: Buraya sadece yönetici girebilecek şekilde ayarla.

export default function SignUp() {

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const messageType = 'createUser';

    const onSubmit = async (values, actions) => {
        setIsLoading(true);
        sendSocketMessage(values,messageType);
    }

    const {values, touched, handleBlur, errors, setErrors, isSubmitting, handleChange, handleSubmit} = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            confirmPassword: '',
            phone: ''
        },
        validationSchema: createUserSchema,
        onSubmit
    });

    useEffect(() => {
        if (socketData && socketData.type === messageType) {
            let apiErrors = {};
            if (socketData.error && socketData.error.code === 11000) { // Unique Errors
                const nonUniqueKeys = Object.keys(socketData.error.keyValue);
                nonUniqueKeys.forEach(key => apiErrors[key] = `${socketData.error.keyValue[key]} daha önceden kullanılmış.`);
            } else if (errors) {   // Validator Errors
                const nonUniqueKeys = Object.keys(errors);
                nonUniqueKeys.forEach(key => apiErrors[key] = errors[key].message);
            }
            setErrors(apiErrors);
            setIsLoading(false);
        }
        // eslint-disable-next-line
    }, [socketData]);


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Kullanıcı Oluştur
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 3}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstName"
                                required
                                fullWidth
                                id="firstName"
                                label="İsim"
                                value={values.firstName}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                error={Boolean(errors.firstName) && touched.firstName}
                                helperText={touched.firstName && errors.firstName}
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Soy İsim"
                                name="lastName"
                                autoComplete="family-name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.lastName}
                                error={Boolean(errors.lastName) && touched.lastName}
                                helperText={touched.lastName && errors.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Kullanıcı Adı"
                                name="username"
                                autoComplete="username"
                                value={values.username}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                error={Boolean(errors.username) && touched.username}
                                helperText={touched.username && errors.username}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                onBlur={handleBlur}
                                helperText={touched.phone && errors.phone}
                                error={Boolean(errors.phone) && touched.phone}
                                value={values.phone}
                                name="phone"
                                onChange={handleChange}
                                fullWidth
                                id="phone"
                                label="Telefon Numarası"
                                autoComplete="tel-local"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+90</InputAdornment>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Şifre"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(errors.password) && touched.password}
                                helperText={touched.password && errors.password}

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
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                onBlur={handleBlur}
                                helperText={touched.confirmPassword && errors.confirmPassword}
                                error={Boolean(errors.confirmPassword) && touched.confirmPassword}
                                value={values.confirmPassword}
                                name="confirmPassword"
                                onChange={handleChange}
                                required
                                fullWidth
                                label="Parola Tekrarı"
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                autoComplete="new-password"

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
                        </Grid>
                    </Grid>
                    <Button
                        disabled={isSubmitting || isLoading}
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    >
                        {isSubmitting || isLoading ? <CircularProgress color="inherit"/> : <>Kaydet</>}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}