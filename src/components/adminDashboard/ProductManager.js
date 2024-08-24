// ProductManager.js
import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../context/SocketContext";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import CoffeeIcon from '@mui/icons-material/EmojiFoodBeverageRounded';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CreateProduct from "./CreateProduct";
import {useSnackbar} from "notistack";
import LoadingProductsSkeleton from './LoadingProductsSkeleton'

export default function ProductManager() {
    const {enqueueSnackbar} = useSnackbar();
    const {sendSocketMessage, socketData, isConnected} = useContext(SocketContext);
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
    const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const getProductsMessageType = 'getProducts';
    const deleteProductMessageType = 'deleteProduct';
    const newProductMessageType = 'newProduct';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isConnected) {
            setIsLoading(true);
            sendSocketMessage({}, getProductsMessageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if (socketData.type === newProductMessageType) {
            if (socketData.message && socketData.message.status === 'success' && socketData.message.product) {
                setProducts(prevState => [...prevState,socketData.message.product] )
                setIsLoading(false);
            }
            return;
        }

        if (socketData.type === 'updateProduct') {
            if (socketData.message.status === "success" && socketData.message.updatedProduct) {
                setProducts(prevState => prevState.map(product => {
                    if (product._id === socketData.message.updatedProduct._id)
                        return socketData.message.updatedProduct;

                    return product;
                }));
                setOpenEditProductDialog(false);
            }
            return
        }

        if (socketData.type === getProductsMessageType) {
            if (socketData.message && socketData.message.status === 'success' && socketData.message.products) {
                setProducts(socketData.message.products);
                setIsLoading(false);
            }
            return;
        }

        if (socketData.type === deleteProductMessageType) {
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});

            if (socketData.message.status === "success")
                setProducts(prevState => prevState.filter(product => product._id !== socketData.message.deletedProductId));
        }
        // eslint-disable-next-line
    }, [socketData]);

    if (isLoading) {
        return (<LoadingProductsSkeleton/>)
    }

    const handleClick = (event, product) => {
        setAnchorEl(event.currentTarget);
        setCurrentProduct(product);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setOpenEditProductDialog(true);
        handleClose();
    };

    const handleDeleteClick = () => {
        setOpenDeleteConfirmDialog(true);
        handleClose();
    };

    const handleConfirmDelete = () => {
        sendSocketMessage({productId: currentProduct._id}, deleteProductMessageType);
        setOpenDeleteConfirmDialog(false);
        setCurrentProduct(null);
    };

    const handleCancelDelete = () => {
        setOpenDeleteConfirmDialog(false);
    };

    const handleAddProductClick = () => {
        setOpenCreateProductDialog(true);
    };

    const handleCloseCreateProductDialog = () => {
        setOpenCreateProductDialog(false);
    };

    const handleCloseEditProductDialog = () => {
        setOpenEditProductDialog(false);
    };

    return (
        <Box sx={{
            width: '100%',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
        }}>
            <Masonry columns={{xs: 1, sm: 2, md: 3}} spacing={isMobile ? 2 : 3}>
                <div>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px',
                            cursor: 'pointer',
                            backgroundColor: theme.palette.background.paper,
                            border: `2px dashed ${theme.palette.primary.main}`,
                        }}
                        onClick={handleAddProductClick}
                    >
                        <CardContent sx={{textAlign: 'center'}}>
                            <CoffeeIcon sx={{fontSize: 60, color: theme.palette.primary.main}}/>
                            <Typography variant="h6" sx={{mt: 2}}>
                                Ürün Ekle
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                {products.map((product) => (
                    <div key={product._id}>
                        <Card variant="outlined" sx={{borderRadius: 2, boxShadow: 2, height: '100%'}}>
                            <CardHeader
                                title={
                                    <Typography variant="h6" noWrap>
                                        {product.productname}
                                    </Typography>
                                }
                                subheader={
                                    <Typography variant="body2" color="textPrimary">
                                        {`Kategori: ${product.productcategory}`}
                                    </Typography>
                                }
                                action={
                                    <IconButton
                                        aria-label="daha fazla seçenek"
                                        onClick={(event) => handleClick(event, product)}
                                        sx={{padding: '10px'}}
                                    >
                                        <MoreVertIcon/>
                                    </IconButton>
                                }
                            />
                            <CardContent>
                                <Typography variant="body2" color="textPrimary" gutterBottom>
                                    <strong>Boyutlar ve Fiyatlar:</strong>
                                </Typography>
                                <Box
                                    sx={{
                                        width: 1,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1, // Chip'ler arasındaki boşluk
                                        justifyContent: 'center', // Çip'leri ortala
                                        mb: 2, // Alt boşluk
                                    }}
                                >
                                    {product.sizes.map((size) => (
                                        <Box
                                            key={size._id}
                                            color="primary"
                                            sx={{
                                                bgcolor: 'primary.light',
                                                color: 'white',
                                                borderRadius: '5px',
                                                display: 'flex',
                                                flexDirection: 'center',
                                                justifyContent: 'space-around',
                                            }}>
                                            <Typography variant="body2"
                                                        sx={{
                                                            bgcolor: 'primary.dark',
                                                            textAlign: 'center',
                                                            color: 'white',
                                                            padding: 0.5,
                                                            ml: '5px'
                                                        }}>
                                                {size.size}
                                            </Typography>
                                            <Typography variant="body2"
                                                        sx={{
                                                            marginLeft:'10px',
                                                            marginRight:'10px',
                                                            borderRadius: '5px',
                                                            fontWeight: 500,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}>
                                                {size.price} ₺
                                            </Typography>
                                        </Box>


                                    ))}
                                </Box>

                                <Typography variant="body2" color="textPrimary" gutterBottom>
                                    <strong>İçerikler:</strong>
                                </Typography>
                                <List dense>
                                    {product.contents.length ? (
                                        product.contents.map((content) => (
                                            <ListItem key={content._id} disableGutters>
                                                <ListItemIcon>
                                                    <InfoIcon fontSize="small" color="primary"/>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${content.name} ${content.extraFee > 0 ? `(+${content.extraFee} ₺)` : ''}`}/>
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem disableGutters>
                                            <ListItemText primary="İçerik bulunmuyor"/>
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>


                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && currentProduct._id === product._id}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: {
                                        boxShadow: 3,
                                        borderRadius: 1,
                                        minWidth: 150,
                                        mt: 1,
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                    }
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={handleEditClick}>
                                    <EditIcon sx={{mr: 1}}/>
                                    Düzenle
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick}>
                                    <DeleteIcon sx={{mr: 1}}/>
                                    Sil
                                </MenuItem>
                            </Menu>
                        </Card>
                    </div>
                ))}
            </Masonry>

            {/* Yeni Ürün Ekleme Dialogu */}
            <Dialog
                open={openCreateProductDialog}
                onClose={handleCloseCreateProductDialog}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle
                    sx={{height: '50px', bgcolor: 'primary.main'}}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <CoffeeIcon sx={{color: 'white', mr: 1}}/>
                        <Typography variant="h6" sx={{color: 'white'}}>
                            Yeni Ürün Ekle
                        </Typography>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseCreateProductDialog}
                        aria-label="close"
                        sx={{
                            color: 'white',
                            width: 40,
                            height: 40,
                            alignSelf: 'center',
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <CreateProduct onClose={handleCloseCreateProductDialog}/>
                </DialogContent>
            </Dialog>

            {/* Ürün Düzenleme Dialogu */}
            <Dialog
                open={openEditProductDialog}
                onClose={handleCloseEditProductDialog}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle
                    sx={{height: '50px', bgcolor: 'primary.main'}}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <EditIcon sx={{color: 'white', mr: 1}}/>
                        <Typography variant="h6" sx={{color: 'white'}}>
                            Ürünü Düzenle
                        </Typography>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseEditProductDialog}
                        aria-label="close"
                        sx={{
                            color: 'white',
                            width: 40,
                            height: 40,
                            alignSelf: 'center',
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="custom-scrollbar" sx={{overflowY: 'auto'}}>
                    {currentProduct &&
                        <CreateProduct productId={currentProduct._id} onClose={handleCloseEditProductDialog}/>}
                </DialogContent>
            </Dialog>

            {/* Ürün Silme Onay Dialogu */}
            <Dialog
                open={openDeleteConfirmDialog}
                onClose={handleCancelDelete}
            >
                <DialogTitle>
                    Ürünü Sil
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Seçili ürünü silmek istediğinize emin misiniz?
                    </Typography>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 2}}>
                        <Button
                            onClick={handleCancelDelete}
                            color="primary"
                            variant="outlined"
                            sx={{mr: 1}}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            color="error"
                            variant="contained"
                        >
                            Sil
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
