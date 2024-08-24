// ProductManager.js
import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
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
import { deepPurple } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CreateProduct from "./CreateProduct";

export default function ProductManager() {
    const { sendSocketMessage, socketData, isConnected } = useContext(SocketContext);
    const [products, setProducts] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
    const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const getProductsMessageType = 'getProducts';
    const deleteProductMessageType = 'deleteProduct';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isConnected) {
            sendSocketMessage({}, getProductsMessageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (socketData && socketData.type === getProductsMessageType) {
            if (socketData.message && socketData.message.status === 'success' && socketData.message.products) {
                setProducts(socketData.message.products);
            }
        }
    }, [socketData]);

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
        sendSocketMessage({ productId: currentProduct._id }, deleteProductMessageType);
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

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
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
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={isMobile ? 2 : 3}>
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
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CoffeeIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Ürün Ekle
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                {products.map((product) => (
                    <div key={product._id}>
                        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: deepPurple[500], width: 40, height: 40 }}>
                                        {product.productname.charAt(0)}
                                    </Avatar>
                                }
                                title={
                                    <Typography variant="h6" noWrap>
                                        {product.productname}
                                    </Typography>
                                }
                                subheader={
                                    <Typography variant="body2" color="textSecondary">
                                        {`Kategori: ${product.productcategory}`}
                                    </Typography>
                                }
                                action={
                                    <IconButton
                                        aria-label="daha fazla seçenek"
                                        onClick={(event) => handleClick(event, product)}
                                        sx={{ padding: '10px' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                            />
                            <CardContent>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    <strong>Boyutlar ve Fiyatlar:</strong>
                                </Typography>
                                <List dense>
                                    {product.sizes.map((size) => (
                                        <ListItem key={size._id} disableGutters>
                                            <ListItemIcon>
                                                <InfoIcon fontSize="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={`${size.size}: ${size.price} TL`} />
                                        </ListItem>
                                    ))}
                                </List>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    <strong>İçerikler:</strong>
                                </Typography>
                                <List dense>
                                    {product.contents.length ? (
                                        product.contents.map((content) => (
                                            <ListItem key={content._id} disableGutters>
                                                <ListItemIcon>
                                                    <InfoIcon fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={`${content.name} (+${content.extraFee} TL)`} />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem disableGutters>
                                            <ListItemText primary="İçerik bulunmuyor" />
                                        </ListItem>
                                    )}
                                </List>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Oluşturulma Tarihi:</strong> {formatDate(product.createdDate)}
                                </Typography>
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
                                    <EditIcon sx={{ mr: 1 }} />
                                    Düzenle
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick}>
                                    <DeleteIcon sx={{ mr: 1 }} />
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
                    sx={{ height: '50px', bgcolor: 'primary.main' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <CoffeeIcon sx={{ color: 'white', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
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
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <CreateProduct onClose={handleCloseCreateProductDialog} />
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
                    sx={{ height: '50px', bgcolor: 'primary.main' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <EditIcon sx={{ color: 'white', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
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
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {/* EditProduct bileşenini burada ekleyin */}
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
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleCancelDelete} color="primary" sx={{ mr: 1 }}>
                            İptal
                        </Button>
                        <Button onClick={handleConfirmDelete} color="secondary">
                            Sil
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
