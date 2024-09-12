import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import {useContext, useEffect, useState} from "react";
import {useFormik} from 'formik';
import {userSchema} from "../../schemas/userSchema";
import {SocketContext} from "../../context/SocketContext";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {systemPermissions} from '../../config';
import Alert from '@mui/material/Alert';
import {useSnackbar} from 'notistack';
import Paper from "@mui/material/Paper";
import {AccountContext} from "../../context/AccountContext";

export default function SignUp({userId = null, onClose}) {
    const {enqueueSnackbar} = useSnackbar();
    const [userData, setUserData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {accountProps} = useContext(AccountContext);
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const isEditMode = !!userId;
    const messageType = isEditMode ? 'updateUser' : 'createUser';
    const getUserMessageType = 'getUser';
    const newUserMessageType = 'newUser';

    useEffect(() => {
        if (!!userId)
            sendSocketMessage({userId}, getUserMessageType)
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        // Kullanıcı verisini almak için
        if (socketData.type === getUserMessageType) {
            if (socketData.message.status === "success" && socketData.message.user) {
                setUserData(socketData.message.user);
                setIsLoading(false);
            }
            return;
        }

        // Yeni kullanıcı veya mesaj verisi geldiğinde
        if (socketData.type === newUserMessageType || socketData.type === messageType) {

            // Token uyumsuzluğu kontrolü
            if (socketData.message.addedByToken && accountProps.oldToken !== socketData.message.addedByToken) {
                return;
            }

            let apiErrors = {};

            // Hata durumunu kontrol et
            if (socketData.message.status === 'error') {

                // MySQL unique constraint hatası (ER_DUP_ENTRY)
                if (socketData.message.error && socketData.message.error.code === 'ER_DUP_ENTRY') {
                    const sqlMessage = socketData.message.error.sqlMessage;

                    // Hangi alanın unique ihlali yaptığını kontrol et
                    if (sqlMessage.includes('username')) {
                        apiErrors.username = "Bu kullanıcı adı zaten alınmış.";
                    }
                    if (sqlMessage.includes('phone')) {
                        apiErrors.phone = "Bu telefon numarası zaten kullanılıyor.";
                    }
                }

                // Formik ile hataları set et
                setErrors(apiErrors);
            }

            // Başarılı mesajı işleme al
            if (Object.keys(apiErrors).length === 0 && socketData.message.message && socketData.message.status) {
                enqueueSnackbar(socketData.message.message, { variant: socketData.message.status });
            }

            // Başarılı durum sonrası
            if (socketData.message.status === 'success') {
                onClose();
            }

            setIsLoading(false);
        }
        // eslint-disable-next-line
    }, [socketData]);

    const onSubmit = async (values) => {
        setIsLoading(true);
        const payload = {...values};
        if (isEditMode) {
            payload.userId = userId;
            delete payload.password;
            delete payload.confirmPassword;
        }
        sendSocketMessage(payload, messageType);
    }

    const {
        values,
        touched,
        handleBlur,
        errors,
        setErrors,
        isSubmitting,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm
    } = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            username: '',
            password: '',
            confirmPassword: '',
            phone: '',
            permissions: '',
        },
        validationSchema: userSchema(isEditMode),
        onSubmit
    });

    useEffect(() => {
        if (userData) {
            // Formu sıfırla ve kullanıcı verileri ile doldur
            resetForm({
                values: {
                    firstname: userData.firstname || '',
                    lastname: userData.lastname || '',
                    username: userData.username || '',
                    password: '',
                    confirmPassword: '',
                    phone: userData.phone || '',
                    permissions: userData.permissions || ''
                }
            });
        }
        // eslint-disable-next-line
    }, [userData]);

    const handleCheckboxChange = (event) => {
        const {value, checked} = event.target;
        const permission = value;

        let currentPermissions = values.permissions.split('');

        if (permission === systemPermissions.sys_admin.code) {
            // 'sys_admin' checkbox'u işaretlendiğinde
            if (checked) {
                currentPermissions = Object.values(systemPermissions).map(p => p.code);
            } else {
                // 'sys_admin' checkbox'u işaretlenmediyse, tüm checkbox'ları temizle
                currentPermissions = [];
            }
        } else {
            // Diğer checkbox'lar için
            if (checked) {
                if (!currentPermissions.includes(permission)) {
                    currentPermissions.push(permission);
                }
            } else {
                currentPermissions = currentPermissions.filter(char => char !== permission);
            }
        }

        setFieldValue('permissions', currentPermissions.join(''));
    };

    return (
        <Container maxWidth="xs" sx={{px: {xs: 0, sm: 2}}}>
            <CssBaseline/>
            <Box
                sx={{
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 2,
                        borderRadius: 2,
                        width: '100%',
                        boxSizing: 'border-box',
                        maxWidth: '100%',
                        margin: 'auto'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Avatar sx={{m: 1, bgcolor: 'primary.main'}}>
                            <PersonAddIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{mb: 2}}>
                            {isEditMode ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 2, width: '100%'}}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="firstname"
                                        required
                                        fullWidth
                                        id="firstname"
                                        label="İsim"
                                        value={values.firstname}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        error={Boolean(errors.firstname) && touched.firstname}
                                        helperText={touched.firstname && errors.firstname}
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastname"
                                        label="Soy İsim"
                                        name="lastname"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.lastname}
                                        error={Boolean(errors.lastname) && touched.lastname}
                                        helperText={touched.lastname && errors.lastname}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="username"
                                        label="Kullanıcı Adı"
                                        name="username"
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
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">+90</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                {!isEditMode && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="password"
                                                label="Şifre"
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={values.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(errors.password) && touched.password}
                                                helperText={touched.password && errors.password}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                tabIndex={-1}
                                                                aria-label="toggle password visibility"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                            >
                                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
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
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                tabIndex={-1}
                                                                aria-label="toggle password visibility"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                            >
                                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12}>
                                    <UserPermissionsCheckboxGroup
                                        onChange={handleCheckboxChange}
                                        selectedPermissions={values.permissions}
                                    />
                                </Grid>
                            </Grid>
                            {!!errors.permissions && (
                                <Alert sx={{mt: 2}} severity="error">
                                    {errors.permissions}
                                </Alert>
                            )}
                            <Button
                                disabled={isSubmitting || isLoading}
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{mt: 3, mb: 2}}
                            >
                                {isSubmitting || isLoading ? (
                                    <CircularProgress color="inherit"/>
                                ) : (
                                    <>{isEditMode ? 'Güncelle' : 'Kaydet'}</>
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

function UserPermissionsCheckboxGroup({onChange, selectedPermissions}) {
    return (
        <FormGroup>
            <Typography variant="h6" gutterBottom>
                Kullanıcı Yetkileri
            </Typography>
            {Object.entries(systemPermissions).map(([key, permission]) => (
                <FormControlLabel
                    key={key}
                    control={<Checkbox value={permission.code} onChange={onChange}/>}
                    label={permission.description}
                    checked={selectedPermissions.includes(permission.code) || selectedPermissions.includes(systemPermissions.sys_admin.code)}
                />
            ))}
        </FormGroup>
    );
}
