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
    LinearProgress,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slider
} from "@mui/material";
import {
    Kitchen as KitchenIcon,
    Done as DoneIcon,
    Cancel as CancelIcon,
    HourglassEmpty as HourglassEmptyIcon,
    CardGiftcard as CardGiftcardIcon,
    HistoryToggleOff,
    Timer as TimerIcon,
    Percent as PercentIcon
} from "@mui/icons-material";
import {keyframes} from "@mui/system";

import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

import Masonry from '@mui/lab/Masonry';
import {SocketContext} from "../context/SocketContext";
import {AccountContext} from "../context/AccountContext";
import {useSnackbar} from "notistack";
import newOrderNotification from '../sounds/newOrderNotification.mp3';
// TODO: Sipariş verilince ses çalmama hatasını gider.
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
    const updateOrderDiscountMessageType = 'updateOrderDiscount'
    const newOrderMessageType = 'newOrder';
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [currentDiscountOrder, setCurrentDiscountOrder] = useState(null);

    const handleRemoveDiscountClick = (orderId) => {
        sendSocketMessage({orderId:orderId,discount:0},updateOrderDiscountMessageType);
    }

    const handleDiscountClick = (orderId) => {
        const order = orders.find(order => order.id === orderId );
        setCurrentDiscountOrder(order);
    }

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        // Burada bildirim seslerini açma/kapatma işlemlerini yapabilirsiniz.
    };

    const playNotificationSound = () => {
        const audio = new Audio(newOrderNotification);
        audio.play().catch(error => console.error("Ses çalma hatası:", error));
    };

    useEffect(() => {
        if (isConnected) {
            sendSocketMessage({}, getProductsMessageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if ( socketData.type === updateOrderDiscountMessageType ){
            setOrders(prevState => prevState.map(order => {
                if (order.id === socketData.message.orderId)
                    return {...order,...socketData.message.newPrices}
                else return order;
            }));
        }


        if (socketData.type === newOrderMessageType) {
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});
            if (socketData.message.newOrder) {
                if (socketData.message.status === "success") {
                    playNotificationSound();
                }

                setOrders(prevState => [socketData.message.newOrder, ...prevState]);
            }
            return;
        }


        if (socketData.type === updateOrderKitchenStatusMessageType) {
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});
            if (socketData.message.orderInfo) {
                setLoadingKitchenStatus(prevState => prevState.filter(item => item !== socketData.message.orderInfo.id));
                setOrders(prevState => prevState.map(order => {
                    if (order.id === socketData.message.orderInfo.id)
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
                setLoadingPaymentStatus(prevState => prevState.filter(item => item !== socketData.message.updatedOrder.id));
                setOrders(prevState => prevState.map(order => {
                    if (order.id === socketData.message.updatedOrder.id)
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
                prevOrders
                    .filter(({createdDate, kitchenStatus, paymentStatus}) => {

                        if ((paymentStatus === 'Daha Sonra Ödenecek' || kitchenStatus === 'Beklemede' || kitchenStatus === 'Hazırlanıyor') && paymentStatus !== 'İptal Edildi')
                            return true

                        const now = new Date();
                        const created = new Date(createdDate);
                        return now - created < 1000 * 60 * 60;
                    })
                    .map(order => ({
                        ...order,
                        formattedDuration: formatDuration(order.createdDate),
                    }))
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handlePaymentStatusChange = (event, orderId) => {
        const selectedOrder = orders.find(order => order.id === orderId);
        setLoadingPaymentStatus(prevState => [...prevState, selectedOrder.id]);
        sendSocketMessage({
            orderId: selectedOrder.id,
            paymentStatus: event.target.value
        }, updateOrderPaymentStatusMessageType);

    };

    const handleKitchenStatusChange = (event, orderId) => {
        const selectedOrder = orders.find(order => order.id === orderId);
        setLoadingKitchenStatus(prevState => [...prevState, selectedOrder.id]);
        sendSocketMessage({
            orderId: selectedOrder.id,
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
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const remainingSecs = diffSecs % 60;
        const remainingMinutes = diffMinutes % 60;
        const remainingHours = diffHours % 24;

        if (diffDays >= 1) {
            // Tarih formatında göster
            const options = {day: 'numeric', month: 'long'};
            return created.toLocaleDateString(undefined, options);
        } else if (diffHours >= 1) {
            return `${remainingHours} saat ${remainingMinutes} dakika önce`;
        } else if (diffMinutes >= 1) {
            return `${remainingMinutes} dakika önce`;
        } else {
            return `${remainingSecs} saniye önce`;
        }
    };

    const fadeInOut = keyframes`
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    `;

    return (
        <>
            <Container maxWidth="xl" sx={{mt: 4}}>
                <Box
                    display="flex"
                    alignItems="start"
                    justifyContent="space-between"
                    padding={1}
                    sx={{borderBottom: '1px solid #ddd', mb: 2}}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{fontWeight: 'bold'}}
                    >
                        Siparişler
                    </Typography>
                    <Tooltip
                        title={notificationsEnabled ? "Bildirim Seslerini Kapat" : "Bildirim Seslerini Aç"}
                        arrow
                    >
                        <IconButton onClick={toggleNotifications}
                                    sx={{color: notificationsEnabled ? 'primary.main' : 'text.secondary'}}>
                            {notificationsEnabled ? <NotificationsIcon/> : <NotificationsOffIcon/>}
                        </IconButton>
                    </Tooltip>
                </Box>
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
                        {orders.map((order,index) => (
                            <Grid item xs={12} md={6} key={`order-${index}`}>
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
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            justifyContent="center" // Elementleri iki uçta hizalar
                                            flexWrap="wrap" // Elemanlar sıkıştığında alt satıra geçmesine izin verir
                                        >
                                            <Box display='flex' flexDirection='column' justifyContent='center'
                                                 width={0.65}>
                                                <Box sx={{display: 'flex', justifyContent: "center"}}>
                                                    <Typography
                                                        variant="body1"
                                                        color="primary"
                                                        fontWeight="medium"
                                                        sx={{
                                                            display: 'inline-block',
                                                            marginRight: '8px',
                                                        }}
                                                    >
                                                        {order.discountedPrice} ₺
                                                    </Typography>

                                                    {order.totalPrice !== order.discountedPrice && (
                                                        <Typography
                                                            variant="body2"
                                                            color="textSecondary"
                                                            sx={{
                                                                textDecoration: 'line-through',
                                                                display: 'inline-block',
                                                            }}
                                                        >
                                                            {order.totalPrice} ₺
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* Alt çizgi */}
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: '1px',
                                                        backgroundColor: 'grey.300',
                                                        mb: 0.7
                                                    }}
                                                />

                                                {!checkPermissions('f') ? (<>
                                                        {
                                                            order.totalPrice !== order.discountedPrice && (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="secondary.light"
                                                                    textAlign='center'
                                                                >
                                                                    %{Math.round(((order.totalPrice - order.discountedPrice) / order.totalPrice) * 100)} İndirim
                                                                </Typography>
                                                            )
                                                        }</>
                                                ) : (<>

                                                    {order.totalPrice === order.discountedPrice ? (
                                                        <Button
                                                            variant="contained" // Arka plan rengi ekler
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#fff',
                                                                color: 'primary.dark',
                                                                width: 0.85,
                                                                margin: 'auto',
                                                                fontSize: '0.75rem',  // Daha küçük yazı boyutu
                                                                padding: '4px 8px',   // Daha küçük padding
                                                                mt: {xs: 1, sm: 0}, // Küçük ekranlarda üstten margin ekler
                                                                borderRadius: '4px', // Kenarları yuvarlatır
                                                                boxShadow: 3, // Hafif gölge efekti ekler
                                                                '&:hover': {
                                                                    backgroundColor: 'primary', // Hover durumunda arka plan rengi
                                                                    color: '#fff', // Hover durumunda yazı rengi
                                                                },
                                                                '&:active': {
                                                                    backgroundColor: '#b71c1c', // Aktif durumunda arka plan rengi
                                                                },
                                                            }}
                                                            startIcon={<PercentIcon/>} // İndirim ikonu
                                                            onClick={() => handleDiscountClick(order.id)} // İndirim işlevi
                                                        >
                                                            İndirim Uygula
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained" // Arka plan rengi ekler
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#ff7686',
                                                                color: '#fff',
                                                                width: 0.85,
                                                                margin: 'auto',
                                                                fontSize: '0.75rem',  // Daha küçük yazı boyutu
                                                                padding: '4px 8px',   // Daha küçük padding
                                                                mt: {xs: 1, sm: 0}, // Küçük ekranlarda üstten margin ekler
                                                                borderRadius: '4px', // Kenarları yuvarlatır
                                                                boxShadow: 3, // Hafif gölge efekti ekler
                                                                '&:hover': {
                                                                    backgroundColor: '#fd5164', // Hover durumunda arka plan rengi
                                                                    color: '#fff', // Hover durumunda yazı rengi
                                                                },
                                                                '&:active': {
                                                                    backgroundColor: '#1565c0', // Aktif durumunda arka plan rengi
                                                                },
                                                            }}
                                                            startIcon={<>
                                                                <PercentIcon/>{Math.round(((order.totalPrice - order.discountedPrice) / order.totalPrice) * 100)}</>} // İndirim ikonu
                                                                onClick={() => handleRemoveDiscountClick(order.id)} // İndirim işlevi
                                                        >
                                                            İndirimi Kaldır
                                                        </Button>
                                                    )}

                                                </>)}

                                            </Box>

                                        </Stack>


                                        {checkPermissions('ef') && <Divider sx={{mt: 4}}/>}

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
                                                                textAlign: 'center'
                                                            }}
                                                            value={order.paymentStatus}
                                                            onChange={(event) => handlePaymentStatusChange(event, order.id)}
                                                            displayEmpty
                                                            renderValue={(selected) =>
                                                                loadingPaymentStatus.includes(order.id) ? (
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
                                                            onChange={(event) => handleKitchenStatusChange(event, order.id)}
                                                            displayEmpty
                                                            renderValue={(selected) =>
                                                                loadingKitchenStatus.includes(order.id) ? (
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
                                                                [
                                                                    <MenuItem key="beklemede" value="Beklemede"
                                                                              disabled={order.kitchenStatus === "Beklemede"}>
                                                                        Beklemede
                                                                    </MenuItem>,
                                                                    <MenuItem key="hazirlanıyor" value="Hazırlanıyor"
                                                                              disabled={order.kitchenStatus === "Hazırlanıyor"}>
                                                                        Hazırlanıyor
                                                                    </MenuItem>,
                                                                    <MenuItem key="hazırlandı" value="Hazırlandı"
                                                                              disabled={order.kitchenStatus === "Hazırlandı"}>
                                                                        Hazırlandı
                                                                    </MenuItem>
                                                                ]
                                                            ) : (
                                                                <MenuItem value={order.kitchenStatus} disabled={true}>İptal
                                                                    edilen sipariş hazırlanamaz</MenuItem>
                                                            )}

                                                        </Select>
                                                    </FormControl>
                                                )}
                                            </Stack>

                                        </Box>

                                    </Box>
                                    <Divider/>
                                    <Box sx={{p: 3}}>
                                        {order.orderNote && (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{
                                                    mb: 1,
                                                    animation: `${fadeInOut} 2.5s infinite`, // Yanıp sönme animasyonu
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    textAlign: 'justify',
                                                    bgcolor: 'rgba(248,203,100,0.96)'
                                                }}
                                            >
                                                <strong>Not:</strong> {order.orderNote}
                                            </Typography>

                                        )}
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
                                            {order.items.map((product,index) => {
                                                return (
                                                    <Grid item xs={12} key={`${product.productName}-content${index}`}>
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
                                                                        {product?.productName || 'Ürün bulunamadı'}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        Boyut: {product.size}
                                                                    </Typography>
                                                                    {product.content && (
                                                                        <Typography variant="body2"
                                                                                    color="textSecondary">
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
            <DiscountDialog order={currentDiscountOrder} setCurrentDiscountOrder={setCurrentDiscountOrder}/>
        </>
    );
}

function DiscountDialog({order,setCurrentDiscountOrder}) {
    const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState(10);
    const {sendSocketMessage} = useContext(SocketContext);
    const updateOrderDiscountMessageType = 'updateOrderDiscount';

    const handleCloseDialog = () => {
        setCurrentDiscountOrder(null);
    };

    const handleApplyDiscount = () => {
        sendSocketMessage({orderId:order.id,discount:selectedDiscountPercentage},updateOrderDiscountMessageType);
        handleCloseDialog();
    };

    const handleSliderChange = (event, newValue) => {
        setSelectedDiscountPercentage(newValue);
    };

    return (
        <Dialog
            open={!!order}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm" // Dialog genişliğini ayarla
            sx={{borderRadius: '8px', boxShadow: 24}} // Yuvarlak köşeler ve gölge ekleyin
        >
            <DialogTitle sx={{fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center'}}>
                İndirim Uygula
            </DialogTitle>
            <DialogContent>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2}}>
                    <Typography textAlign='center' variant="h6" gutterBottom>
                        Seçilen İndirim Yüzdesi: {selectedDiscountPercentage}%
                    </Typography>
                    <Slider
                        aria-label="İndirim Yüzdesi"
                        value={selectedDiscountPercentage}
                        onChange={handleSliderChange}
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        marks={[
                            {value: 0, label: '0%'},
                            {value: 25, label: '25%'},
                            {value: 50, label: '50%'},
                            {value: 75, label: '75%'},
                            {value: 100, label: '100%'},
                        ]}
                        sx={{
                            width: '100%',
                            mt: 2,
                            '& .MuiSlider-thumb': {
                                backgroundColor: '#3f51b5', // Slider thumb rengi
                                border: '2px solid #fff', // Thumb çevresine beyaz sınır ekleyin
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: '#3f51b5', // Slider track rengi
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: '#b0bec5', // Slider rail rengi
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} variant="outlined" color="secondary" sx={{mr: 1}}>
                    Kapat
                </Button>
                <Button onClick={handleApplyDiscount} variant="contained" color="primary">
                    Uygula
                </Button>
            </DialogActions>
        </Dialog>
    );
}