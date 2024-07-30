import React, { useContext, useEffect, useState } from 'react';
import {
    Grid,
    Typography,
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    IconButton,
    Divider,
    Card,
    CardContent,
    CardActions,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { SocketContext } from '../context/SocketContext';
import { turkishToLower } from '../helper/stringTurkish';
import SearchIcon from '@mui/icons-material/Search';

export default function OrderEntry() {
    const { sendSocketMessage, socketData, isConnected } = useContext(SocketContext);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedContent, setSelectedContent] = useState('');
    const [orders, setOrders] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const messageType = 'getProducts';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isConnected) {
            sendSocketMessage({}, messageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (socketData && socketData.type === messageType) {
            if (socketData.message && socketData.message.status === 'success' && socketData.message.products) {
                setProducts(socketData.message.products);
            }
        }
    }, [socketData]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSelectedSize(product.sizes.length === 1 ? product.sizes[0].size : '');
        setSelectedContent(product.contents.length > 0 ? product.contents[0].name : '');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddToOrder = () => {
        if (!selectedSize) {
            alert('Lütfen boyut seçin!');
            return;
        }

        if (selectedProduct.contents.length > 0 && !selectedContent) {
            alert('Lütfen içerik seçin!');
            return;
        }

        const newOrder = {
            product: selectedProduct,
            quantity,
            size: selectedSize,
            content: selectedContent || ''
        };

        setOrders(prevOrders => {
            const updatedOrders = [...prevOrders];
            const existingOrderIndex = updatedOrders.findIndex(order =>
                order.product._id === newOrder.product._id &&
                order.size === newOrder.size &&
                order.content === newOrder.content
            );

            if (existingOrderIndex !== -1) {
                updatedOrders[existingOrderIndex].quantity += newOrder.quantity;
            } else {
                updatedOrders.push(newOrder);
            }

            return updatedOrders;
        });

        setOpen(false);
    };

    const filteredProducts = products.filter(product => {
        const searchTermLower = turkishToLower(searchTerm);
        const productNameMatch = turkishToLower(product.productname).includes(searchTermLower);
        const productCategoryMatch = turkishToLower(product.productcategory).includes(searchTermLower);
        const contentMatch = product.contents.some(content =>
            turkishToLower(content.name).includes(searchTermLower)
        );
        return productNameMatch || productCategoryMatch || contentMatch;
    });

    const handleCartToggle = () => {
        setShowCart(!showCart);
    };

    return (
        <>
            <Grid container spacing={0} sx={{ height: '100vh', overflow: 'hidden' }}>
                {/* Sol Taraf - Ürünler */}
                <Grid item xs={12} sm={6} sx={{ borderRight: '1px solid #ddd', display: isMobile && showCart ? 'none' : 'block' }}>
                    <Box
                        sx={{
                            padding: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6">Ürünler</Typography>
                            <TextField
                                variant="outlined"
                                placeholder="Ürün ara..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <IconButton>
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                                sx={{ maxWidth: 300 }}
                            />
                        </Box>
                        <List>
                            {filteredProducts.map(product => (
                                <ListItem
                                    button
                                    key={product._id}
                                    onClick={() => handleProductClick(product)}
                                    sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                                >
                                    <ListItemText
                                        primary={product.productname}
                                        secondary={product.productcategory}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>

                {/* Sağ Taraf - Sipariş Ayrıntıları */}
                <Grid item xs={12} sm={6} md={6} sx={{ display: isMobile && !showCart ? 'none' : 'block' }}>
                    <Box
                        sx={{
                            backgroundColor: '#f9fafc',
                            padding: 2,
                            borderRadius: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        <Typography variant="h6">Sipariş Ayrıntıları</Typography>
                        <Divider />
                        {orders.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {orders.map((order, index) => (
                                    <Card key={index} sx={{ marginBottom: 1 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ marginRight: 2, fontWeight: 'bold' }}
                                                >
                                                    {order.quantity}x
                                                </Typography>
                                                <Box>
                                                    <Typography variant="h6">
                                                        {order.product.productname}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Boyut: {order.size}
                                                    </Typography>
                                                    {order.content && (
                                                        <Typography variant="body2">
                                                            İçerik: {order.content}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2">
                                                        Fiyat: {order.product.sizes.find(size => size.size === order.size)?.price || 0} TL
                                                        {order.content && ` (+${order.product.contents.find(content => content.name === order.content)?.extraFee || 0} TL)`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small" color="primary">Düzenle</Button>
                                            <Button size="small" color="error">Sil</Button>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2">Sipariş yok.</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Sepet Düğmesi */}
            {isMobile && (
                <IconButton
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        backgroundColor: '#f9fafc',
                        boxShadow: 3,
                        '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                    onClick={handleCartToggle}
                    aria-label={showCart ? 'Kapat' : 'Sepet'}
                >
                    {showCart ? <CloseIcon /> : <ShoppingCartIcon />}
                </IconButton>
            )}

            {/* Ürün Seçimi Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Ürün Seçimi</DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6">{selectedProduct.productname}</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Boyut</InputLabel>
                                <Select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    label="Boyut"
                                    required
                                >
                                    {selectedProduct.sizes.map(size => (
                                        <MenuItem key={size.size} value={size.size}>
                                            {size.size}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {selectedProduct.contents.length > 0 && (
                                <FormControl fullWidth>
                                    <InputLabel>İçerik</InputLabel>
                                    <Select
                                        value={selectedContent}
                                        onChange={(e) => setSelectedContent(e.target.value)}
                                        label="İçerik"
                                        required
                                    >
                                        {selectedProduct.contents.map(content => (
                                            <MenuItem key={content.name} value={content.name}>
                                                {content.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <TextField
                                type="number"
                                label="Adet"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                                fullWidth
                                InputProps={{ inputProps: { min: 1 } }}
                                required
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleAddToOrder} variant="contained">Sipariş Ver</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
