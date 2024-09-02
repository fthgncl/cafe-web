import * as React from 'react';
import {
    Button,
    Box,
    Container,
    CssBaseline,
    Grid,
    TextField,
    InputAdornment,
    Typography,
    IconButton,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircleOutlineTwoTone';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {useFormik} from 'formik';
import {productSchema} from '../../schemas/productSchema';
import {useContext, useEffect, useState} from 'react';
import {SocketContext} from '../../context/SocketContext';
import {useSnackbar} from 'notistack';
import CoffeeIcon from '@mui/icons-material/EmojiFoodBeverageRounded';
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import {AccountContext} from "../../context/AccountContext";

export default function ProductForm({productId = null, onClose}) {

    const {enqueueSnackbar} = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const {accountProps} = useContext(AccountContext);
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const isEditMode = !!productId;
    const messageType = isEditMode ? 'updateProduct' : 'createProduct';
    const getProductMessageType = 'getProduct';
    const newProductMessageType = 'newProduct';

    useEffect(() => {
        if (!!productId)
            sendSocketMessage({productId}, getProductMessageType)
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if (socketData.type === getProductMessageType) {
            if (socketData.message.status === "success" && socketData.message.product) {
                setProductData(socketData.message.product);
                setIsLoading(false);
            }
            return;
        }

        if (socketData.type === newProductMessageType || socketData.type === messageType) {

            if (socketData.message.addedByToken && accountProps.oldToken !== socketData.message.addedByToken)
                return;

            let apiErrors = {}; // TODO: Buranın mysqlden gelen veriye göre güncellenmesi lazım
            if (socketData.message.status === 'error') {
                if (socketData.message.error && socketData.message.error.code === 11000) { // Unique Errors
                    const nonUniqueKeys = Object.keys(socketData.message.error.keyValue);
                    nonUniqueKeys.forEach(key => apiErrors[key] = `${socketData.message.error.keyValue[key]} daha önceden kullanılmış.`);
                }
                formik.setErrors(apiErrors);
            }

            if (Object.keys(apiErrors).length === 0 && socketData.message.message && socketData.message.status) {
                enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});
            }


            if (socketData.message.status === 'success') {
                formik.resetForm();
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
            payload.productId = productId;
        }
        sendSocketMessage(payload, messageType);
    }

    const formik = useFormik({
        initialValues: {
            productName: '',
            productCategory: '',
            sizes: [{size: 'Standart', price: ''}],
            contents: []
        },
        validationSchema: productSchema,
        onSubmit
    });

    useEffect(() => {
        if (productData) {
            // Formu sıfırla ve kullanıcı verileri ile doldur
            formik.resetForm({
                values: {
                    productName: productData.productName || '',
                    productCategory: productData.productCategory || '',
                    sizes: productData.sizes || [{size: 'Standart', price: ''}],
                    contents: productData.contents || [],
                }
            });
        }
        // eslint-disable-next-line
    }, [productData]);

    const handleAddSize = () => {
        if (formik.values.sizes.length < 1) {
            // En az bir boyut olması gerekiyor
            return;
        }
        formik.setFieldValue('sizes', [...formik.values.sizes, {size: '', price: ''}]);
    };

    const handleRemoveSize = (index) => {
        if (formik.values.sizes.length > 1) {
            const newSizes = formik.values.sizes.filter((_, i) => i !== index);
            formik.setFieldValue('sizes', newSizes);
        }
    };

    const handleSizeChange = (index, event) => {
        const {name, value} = event.target;
        const newSizes = formik.values.sizes.map((size, i) =>
            i === index ? {...size, [name]: value} : size
        );
        formik.setFieldValue('sizes', newSizes);
    };

    const handleAddContent = () => {
        formik.setFieldValue('contents', [...formik.values.contents, {name: '', extraFee: ''}]);
    };

    const handleRemoveContent = (index) => {
        const newContents = formik.values.contents.filter((_, i) => i !== index);
        formik.setFieldValue('contents', newContents);
    };

    const handleContentChange = (index, event) => {
        const {name, value} = event.target;
        const newContents = formik.values.contents.map((content, i) =>
            i === index ? {...content, [name]: value} : content
        );
        formik.setFieldValue('contents', newContents);
    };

    return (
        <Container component="main" maxWidth="xs">
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
                            <CoffeeIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{mb: 2}}>
                            {isEditMode ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                        </Typography>
                        <Box sx={{
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                            mt: 3
                        }}>

                            <Box sx={{width: 1, display: 'flex', padding: 2}}>
                                <form onSubmit={formik.handleSubmit}>
                                    <Grid container spacing={2}>

                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                id="productName"
                                                label="Ürün Adı"
                                                name="productName"
                                                value={formik.values.productName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={Boolean(formik.errors.productName) && formik.touched.productName}
                                                helperText={formik.touched.productName && formik.errors.productName}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                id="productCategory"
                                                label="Kategori"
                                                name="productCategory"
                                                value={formik.values.productCategory}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={Boolean(formik.errors.productCategory) && formik.touched.productCategory}
                                                helperText={formik.touched.productCategory && formik.errors.productCategory}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{marginTop: 2, textAlign: 'center'}}>
                                                <Typography variant="h6" gutterBottom>
                                                    Ürün Boyutları
                                                </Typography>
                                                {formik.values.sizes.map((size, index) => (
                                                    <Box key={index} sx={{
                                                        marginBottom: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box sx={{display: 'flex', gap: 2, flexGrow: 1}}>
                                                            <TextField
                                                                required
                                                                fullWidth
                                                                label="Boyut Adı"
                                                                name="size"
                                                                value={size.size}
                                                                onChange={(event) => handleSizeChange(index, event)}
                                                            />
                                                            <TextField
                                                                required
                                                                fullWidth
                                                                label="Fiyat (₺)"
                                                                name="price"
                                                                type="number"
                                                                value={size.price}
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment
                                                                        position="start">₺</InputAdornment>,
                                                                }}
                                                                onChange={(event) => handleSizeChange(index, event)}
                                                            />
                                                        </Box>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveSize(index)}
                                                            sx={{marginLeft: 2}}
                                                        >
                                                            <CancelOutlinedIcon/>
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                                <Button
                                                    sx={{
                                                        height: '30px',
                                                        textTransform: 'none'
                                                    }}
                                                    variant="outlined"
                                                    startIcon={<AddIcon/>}
                                                    onClick={handleAddSize}
                                                >
                                                    Boyut Ekle
                                                </Button>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{marginTop: 2, textAlign: 'center'}}>
                                                <Typography variant="h6" gutterBottom>
                                                    Ürün İçeriği
                                                </Typography>
                                                {formik.values.contents.map((content, index) => (
                                                    <Box key={index} sx={{
                                                        marginBottom: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box sx={{display: 'flex', gap: 2, flexGrow: 1}}>
                                                            <TextField
                                                                required
                                                                fullWidth
                                                                label="İçerik Adı"
                                                                name="name"
                                                                value={content.name}
                                                                onChange={(event) => handleContentChange(index, event)}
                                                            />
                                                            <TextField
                                                                required
                                                                fullWidth
                                                                label="Ek Ücret (₺)"
                                                                name="extraFee"
                                                                type="number"
                                                                value={content.extraFee}
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment
                                                                        position="start">₺</InputAdornment>,
                                                                }}
                                                                onChange={(event) => handleContentChange(index, event)}
                                                            />
                                                        </Box>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveContent(index)}
                                                            sx={{marginLeft: 2}}
                                                        >
                                                            <CancelOutlinedIcon/>
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                                <Button
                                                    sx={{
                                                        height: '30px',
                                                        textTransform: 'none'
                                                    }}
                                                    variant="outlined"
                                                    startIcon={<AddIcon/>}
                                                    onClick={handleAddContent}
                                                >
                                                    İçerik Ekle
                                                </Button>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                sx={{mt: 3, mb: 2}}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <CircularProgress color="inherit"
                                                                               size={24}/> : isEditMode ? 'Güncelle' : 'Kaydet'}
                                            </Button>
                                        </Grid>

                                    </Grid>
                                </form>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
