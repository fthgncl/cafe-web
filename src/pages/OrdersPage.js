import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {
    Box,
    Card,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    LinearProgress
} from "@mui/material";
import {
    Kitchen as KitchenIcon,
    Done as DoneIcon,
    Cancel as CancelIcon,
    HourglassEmpty as HourglassEmptyIcon,
    CardGiftcard as CardGiftcardIcon,
    HistoryToggleOff,
    Timer as TimerIcon,
} from "@mui/icons-material";
import {keyframes} from "@mui/system";
import Masonry from '@mui/lab/Masonry';
import {SocketContext} from "../context/SocketContext";
import {AccountContext} from "../context/AccountContext";
import {useSnackbar} from "notistack";

export default function OrdersPage() {
    const {sendSocketMessage, socketData, isConnected} = useContext(SocketContext);
    const {checkPermissions} = useContext(AccountContext);
    const {enqueueSnackbar} = useSnackbar();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPaymentStatus, setLoadingPaymentStatus] = useState([]);
    const [loadingKitchenStatus, setLoadingKitchenStatus] = useState([]);
    const getOrdersMessageType = "getOrders";
    const getProductsMessageType = 'getProducts';
    const updateOrderPaymentStatusMessageType = 'updateOrderPaymentStatus';
    const updateOrderKitchenStatusMessageType = 'updateOrderKitchenStatus';

    useEffect(() => {
        if (isConnected) {
            sendSocketMessage({}, getProductsMessageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;


        if (socketData.type === updateOrderKitchenStatusMessageType) {
            console.log(socketData.message);
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});
            if (socketData.message.orderInfo) {
                setLoadingKitchenStatus(prevState => prevState.filter(item => item !== socketData.message.orderInfo.id));
                setOrders(prevState => prevState.map(order => {
                    if (order._id === socketData.message.orderInfo.id)
                        return {...order, kitchenStatus: socketData.message.orderInfo.newKitchenStatus}
                    else return order;
                }));
            }
            setLoading(false);
            return;
        }

        if (socketData.type === updateOrderPaymentStatusMessageType) {
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});
            if (socketData.message.updatedOrder) {
                setLoadingPaymentStatus(prevState => prevState.filter(item => item !== socketData.message.updatedOrder._id));
                setOrders(prevState => prevState.map(order => {
                    if (order._id === socketData.message.updatedOrder._id)
                        return {...order, paymentStatus: socketData.message.updatedOrder.paymentStatus}
                    else return order;
                }));
            }
            setLoading(false);
            return;
        }

        if (socketData.message.status !== 'success')
            return;

        if (socketData.type === getOrdersMessageType) {
            if (socketData.message.orders) {
                const ordersArray = Object.values(socketData.message.orders);
                setOrders(ordersArray.reverse());
            }
            setLoading(false);
            return;
        }

        if (socketData.type === getProductsMessageType) {
            if (socketData.message.products) {
                setProducts(socketData.message.products);
                sendSocketMessage({}, getOrdersMessageType);
            }
        }

        // eslint-disable-next-line
    }, [socketData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setOrders((prevOrders) =>
                prevOrders.map((order) => ({
                    ...order,
                    formattedDuration: formatDuration(order.createdDate),
                }))
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handlePaymentStatusChange = (event, orderId) => {
        const selectedOrder = orders.find(order => order._id === orderId);
        setLoadingPaymentStatus(prevState => [...prevState, selectedOrder._id]);
        sendSocketMessage({
            orderId: selectedOrder._id,
            paymentStatus: event.target.value
        }, updateOrderPaymentStatusMessageType);

    };

    const handleKitchenStatusChange = (event, orderId) => {
        const selectedOrder = orders.find(order => order._id === orderId);
        setLoadingKitchenStatus(prevState => [...prevState, selectedOrder._id]);
        sendSocketMessage({
            orderId: selectedOrder._id,
            kitchenStatus: event.target.value
        }, updateOrderKitchenStatusMessageType);
    };

    const getPaymentStatusColor = (paymentStatus) => {
        switch (paymentStatus) {
            case "Ödendi":
                return "success";
            case "Daha Sonra Ödenecek":
                return "warning";
            case "İptal Edildi":
                return "error";
            case "Hediye":
                return "info";
            default:
                return "default";
        }
    };

    const getPaymentStatusIcon = (paymentStatus) => {
        switch (paymentStatus) {
            case "Ödendi":
                return <DoneIcon/>;

            case "Bekliyor":
                return <HourglassEmptyIcon/>;

            case "İptal Edildi":
                return <CancelIcon/>;

            case "Hediye":
                return <CardGiftcardIcon/>;

            case "Daha Sonra Ödenecek":
                return <HistoryToggleOff/>;

            default:
                return null;
        }
    };

    const getKitchenStatusColor = (kitchenStatus) => {
        switch (kitchenStatus) {
            case "Beklemede":
                return "default";
            case "Hazırlanıyor":
                return "warning";
            case "Hazırlandı":
                return "success";
            case "İptal Edildi":
                return "error";
            default:
                return "default";
        }
    };

    const blink = keyframes`
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    `;

    const kitchenStatusIcons = {
        "Beklemede": <HourglassEmptyIcon sx={{animation: `${blink} 1s infinite`}}/>,
        "Hazırlanıyor": <KitchenIcon sx={{animation: `${blink} 1s infinite`}}/>,
        "Hazırlandı": <DoneIcon/>,
        "İptal Edildi": <CancelIcon/>,
    };

    const formatDuration = (createdAt) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now - created;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSecs / 60);
        const remainingSecs = diffSecs % 60;

        if (diffMinutes >= 2) {
            return `${diffMinutes} dakika önce`;
        } else {
            if (diffMinutes > 0)
                return `${diffMinutes} dakika ${remainingSecs} saniye önce`;
            else return `${remainingSecs} saniye önce`;
        }
    };

    return (
        <Container maxWidth="xl" sx={{mt: 4}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Siparişler
            </Typography>
            {loading ? (
                <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "80vh"}}>
                    <CircularProgress/>
                </Box>
            ) : orders.length > 0 ? (
                <Masonry
                    spacing={2}
                    columns={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        xl: 4
                    }}
                >
                    {orders.map((order) => (
                        <Grid item xs={12} md={6} key={order._id}>
                            <Card variant="outlined" sx={{borderRadius: 3, boxShadow: 3, overflow: "hidden"}}>
                                <Box sx={{p: 3}}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center"
                                           sx={{mb: 2}}>
                                        <Typography variant="h6" component="div" fontWeight="bold">
                                            {order.customerName}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <TimerIcon color="action"/>
                                            <Typography variant="body2" color="textSecondary">
                                                {order.formattedDuration || formatDuration(order.createdDate)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    {order.totalPrice && (
                                        <Typography
                                            variant="body1"
                                            color="primary"
                                            fontWeight="medium"
                                            sx={{
                                                mb: 1,
                                                display: 'inline-block',
                                                marginRight: '8px'
                                            }}
                                        >
                                            {order.discountedPrice} ₺
                                        </Typography>
                                    )}

                                    {order.totalPrice !== order.discountedPrice && (
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                textDecoration: 'line-through',
                                                mb: 1,
                                                display: 'inline-block'
                                            }}
                                        >
                                            {order.totalPrice} ₺
                                        </Typography>
                                    )}


                                    <Divider sx={{mt: 4}}/>

                                    <Box>
                                        <Stack spacing={2} flexWrap="wrap">
                                            {/* Ödeme Durumu Seçimi */}
                                            {checkPermissions('e') && order.paymentStatus && (
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        id="payment-status-label"
                                                        sx={{
                                                            textAlign: 'center',
                                                            backgroundColor: 'background.paper',
                                                            paddingX: 1
                                                        }}
                                                    >
                                                        Ödeme Durumu
                                                    </InputLabel>
                                                    <Select
                                                        labelId="payment-status-label"
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            minWidth: 200,
                                                            textAlign: 'center',
                                                            mt: 1
                                                        }}
                                                        value={order.paymentStatus}
                                                        onChange={(event) => handlePaymentStatusChange(event, order._id)}
                                                        displayEmpty
                                                        renderValue={(selected) =>
                                                            loadingPaymentStatus.includes(order._id) ? (
                                                                <LinearProgress sx={{mt: 1.2}}/>
                                                            ) : (
                                                                <Chip
                                                                    icon={getPaymentStatusIcon(order.paymentStatus)}
                                                                    label={order.paymentStatus}
                                                                    color={getPaymentStatusColor(order.paymentStatus)}
                                                                    sx={{flexGrow: 1, width: 1}}
                                                                />
                                                            )
                                                        }
                                                    >
                                                        <MenuItem
                                                            value="Daha Sonra Ödenecek"
                                                            disabled={order.paymentStatus === "Daha Sonra Ödenecek"
                                                            }>
                                                            Daha Sonra Ödenecek
                                                        </MenuItem>
                                                        <MenuItem value="Hediye"
                                                                  disabled={order.paymentStatus === "Hediye"}>
                                                            Hediye
                                                        </MenuItem>
                                                        <MenuItem value="İptal Edildi"
                                                                  disabled={order.paymentStatus === "İptal Edildi"}>
                                                            İptal Edildi
                                                        </MenuItem>
                                                        <MenuItem value="Ödendi"
                                                                  disabled={order.paymentStatus === "Ödendi"}>
                                                            Ödendi
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                            {/* Mutfak Durumu Seçimi */}
                                            {checkPermissions('g') && order.kitchenStatus && (
                                                <FormControl fullWidth>
                                                    <Divider sx={{mt: 0}}/>
                                                    <InputLabel
                                                        id="kitchen-status-label"
                                                        sx={{
                                                            textAlign: 'center',
                                                            backgroundColor: 'background.paper',
                                                            paddingX: 1
                                                        }}
                                                    >
                                                        Mutfak Durumu
                                                    </InputLabel>
                                                    <Select
                                                        labelId="kitchen-status-label"
                                                        sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            minWidth: 200,  // Genişliği artır
                                                            textAlign: 'center',
                                                            mt: 1
                                                        }}
                                                        value={order.kitchenStatus}
                                                        onChange={(event) => handleKitchenStatusChange(event, order._id)}
                                                        displayEmpty
                                                        renderValue={(selected) =>
                                                            loadingKitchenStatus.includes(order._id) ? (
                                                                <LinearProgress sx={{mt: 1.2}}/>
                                                            ) : (
                                                                <Chip
                                                                    icon={kitchenStatusIcons[order.paymentStatus !== "İptal Edildi" ? order.kitchenStatus : 'İptal Edildi']}
                                                                    label={order.paymentStatus !== "İptal Edildi" ? order.kitchenStatus : 'İptal Edildi'}
                                                                    color={getKitchenStatusColor(order.paymentStatus !== "İptal Edildi" ? order.kitchenStatus : 'İptal Edildi')}
                                                                    sx={{flexGrow: 1, width: 1}}
                                                                />
                                                            )
                                                        }
                                                    >
                                                        {order.paymentStatus !== "İptal Edildi" ? (
                                                            <>
                                                                <MenuItem
                                                                    value="Beklemede"
                                                                    disabled={order.kitchenStatus === "Beklemede"}
                                                                >
                                                                    Beklemede
                                                                </MenuItem>
                                                                <MenuItem
                                                                    value="Hazırlanıyor"
                                                                    disabled={order.kitchenStatus === "Hazırlanıyor"}
                                                                >
                                                                    Hazırlanıyor
                                                                </MenuItem>
                                                                <MenuItem
                                                                    value="Hazırlandı"
                                                                    disabled={order.kitchenStatus === "Hazırlandı"}
                                                                >
                                                                    Hazırlandı
                                                                </MenuItem>
                                                            </>
                                                        ):<MenuItem disabled={true}>İptal edilen sipariş hazırlanamaz</MenuItem>}

                                                    </Select>
                                                </FormControl>
                                                )}
                                        </Stack>

                                    </Box>

                                </Box>
                                <Divider/>
                                <Box sx={{p: 3}}>
                                    <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
                                        <strong>Not:</strong> {order.orderNote || "Sipariş notu yok"}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
                                        <strong>Siparişi Alan:</strong> {order.createdBy}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
                                        <strong>Müşteri Adı:</strong> {order.customerName}
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        Ürünler
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {order.orders.map((product) => {
                                            const savedProduct = products.find(p => p._id === product.product);

                                            return (
                                                <Grid item xs={12} key={product._id}>
                                                    <Paper elevation={4}
                                                           sx={{p: 3, borderRadius: 4, backgroundColor: '#f9f9f9'}}>
                                                        <Stack direction="row" spacing={3} alignItems="center">
                                                            <Typography
                                                                variant="h5"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    transform: 'rotate(-10deg)',
                                                                    color: '#333'
                                                                }}
                                                            >
                                                                {product.quantity}x
                                                            </Typography>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="bold"
                                                                            color="textPrimary">
                                                                    {savedProduct?.productname || 'Ürün bulunamadı'}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    Boyut: {product.size}
                                                                </Typography>
                                                                {product.content && (
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        İçerik: {product.content}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>

                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Masonry>
            ) : (
                <Box sx={{textAlign: "center", py: 5}}>
                    <Typography variant="h6" color="textSecondary">
                        Henüz sipariş bulunmamaktadır.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

