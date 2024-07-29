import * as React from 'react';
import {
    Button,
    Box,
    Container,
    CssBaseline,
    Grid,
    TextField,
    InputAdornment,
    FormControl,
    FormControlLabel,
    Checkbox,
    Typography,
    IconButton,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircleOutlineTwoTone';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useFormik } from 'formik';
import { productSchema } from '../schemas/productSchema';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useSnackbar } from 'notistack';

export default function ProductForm() {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const { sendSocketMessage, socketData } = useContext(SocketContext);
    const messageType = 'createProduct';

    useEffect(() => {
        console.log('mesaj geldi',socketData);
        if (socketData && socketData.type === messageType) {
            if (socketData.message.message && socketData.message.status) {
                enqueueSnackbar(socketData.message.message, { variant: socketData.message.status });
            }

            if (socketData.message.status === 'success') {
                formik.resetForm();
            }

            setIsLoading(false);
        }
        // eslint-disable-next-line
    }, [socketData]);

    const formik = useFormik({
        initialValues: {
            productname: '',
            productcategory: '',
            productprice: '',
            sizes: {
                small: false,
                medium: false,
                large: false,
            },
            contents: []
        },
        validationSchema: productSchema,
        onSubmit: (values) => {
            setIsLoading(true);
            sendSocketMessage(values, messageType);
        },
    });

    const handleAddContent = () => {
        formik.setFieldValue('contents', [...formik.values.contents, { name: '', extraFee: '' }]);
    };

    const handleRemoveContent = (index) => {
        const newContents = formik.values.contents.filter((_, i) => i !== index);
        formik.setFieldValue('contents', newContents);
    };

    const handleContentChange = (index, event) => {
        const { name, value } = event.target;
        const newContents = formik.values.contents.map((content, i) =>
            i === index ? { ...content, [name]: value } : content
        );
        formik.setFieldValue('contents', newContents);
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{
                    width: 450,
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    boxShadow: 3
                }}>
                    <Box sx={{
                        backgroundColor: 'rgba(25,117,209,0.24)',
                        width: 1,
                        height: '140px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Button
                            sx={{
                                height: '30px',
                                textTransform: 'none'
                            }}
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                        >
                            Görsel Ekle
                        </Button>
                    </Box>

                    <Box sx={{ width: 1, display: 'flex', padding: 2 }}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="productname"
                                        label="Ürün Adı"
                                        name="productname"
                                        value={formik.values.productname}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={Boolean(formik.errors.productname) && formik.touched.productname}
                                        helperText={formik.touched.productname && formik.errors.productname}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="productcategory"
                                        label="Kategori"
                                        name="productcategory"
                                        value={formik.values.productcategory}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={Boolean(formik.errors.productcategory) && formik.touched.productcategory}
                                        helperText={formik.touched.productcategory && formik.errors.productcategory}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="productprice"
                                        label="Ürün Fiyatı"
                                        name="productprice"
                                        type="number"
                                        value={formik.values.productprice}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={Boolean(formik.errors.productprice) && formik.touched.productprice}
                                        helperText={formik.touched.productprice && formik.errors.productprice}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom>
                                            Ürün Boyutları
                                        </Typography>
                                        <FormControl component="fieldset">
                                            <Grid container spacing={2} justifyContent="center">
                                                <Grid item>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={formik.values.sizes.small}
                                                                onChange={formik.handleChange}
                                                                name="sizes.small"
                                                            />
                                                        }
                                                        label="Küçük Boy"
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={formik.values.sizes.medium}
                                                                onChange={formik.handleChange}
                                                                name="sizes.medium"
                                                            />
                                                        }
                                                        label="Orta Boy"
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={formik.values.sizes.large}
                                                                onChange={formik.handleChange}
                                                                name="sizes.large"
                                                            />
                                                        }
                                                        label="Büyük Boy"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom>
                                            Ürün İçeriği
                                        </Typography>
                                        {formik.values.contents.map((content, index) => (
                                            <Box key={index} sx={{ marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
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
                                                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                                        }}
                                                        onChange={(event) => handleContentChange(index, event)}
                                                    />
                                                </Box>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveContent(index)}
                                                    sx={{ marginLeft: 2 }}
                                                >
                                                    <CancelOutlinedIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button
                                            sx={{
                                                height: '30px',
                                                textTransform: 'none'
                                            }}
                                            variant="outlined"
                                            startIcon={<AddIcon />}
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
                                        sx={{ mt: 3, mb: 2 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <CircularProgress color="inherit" size={24} /> : 'Kaydet'}
                                    </Button>
                                </Grid>

                            </Grid>
                        </form>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
