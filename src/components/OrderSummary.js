import React, {useContext, useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    FormControl,
    FormHelperText,
    InputLabel,
    Select,
    MenuItem,
    Slider
} from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {AccountContext} from "../context/AccountContext";
import { SocketContext } from "../context/SocketContext";
import LoadingButton from '@mui/lab/LoadingButton';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import {useSnackbar} from "notistack";

const OrderSummary = ({orders, clearOrders, calculateTotalPrice}) => {

    const { enqueueSnackbar } = useSnackbar();

    const PaymentStatusEnum = Object.freeze({
        GIFT: 'Hediye',
        PAID: 'Ödendi',
        PAY_LATER: 'Daha Sonra Ödenecek'
    });

    const messageType = 'orderEntry';
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(true);
    const [orderNote, setOrderNote] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paymentStatusError, setPaymentStatusError] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [showDiscountField, setShowDiscountField] = useState(false);
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const [lastDiscountFields, setLastDiscountFields] = useState({
        gift: paymentStatus === PaymentStatusEnum.GIFT,
        showDiscountField,
        isDiscountApplied,
        discount
    });
    const {checkPermissions} = useContext(AccountContext);

    const resetForm = () =>{
        setOrderNote('');
        setPaymentStatus('');
        setPaymentStatusError(false);
        setDiscount(0);
        setShowDiscountField(false)
        setIsDiscountApplied(false)
        clearOrders();
    }

    useEffect(() => {

        if (socketData && socketData.type === messageType) {

            enqueueSnackbar(socketData.message.message, { variant: socketData.message.status });
            setIsLoading(false);
            resetForm();
        }

        // eslint-disable-next-line
    }, [socketData]);

    useEffect(() => {
        if (paymentStatus === PaymentStatusEnum.GIFT) {
            setLastDiscountFields({gift: true, showDiscountField, isDiscountApplied,discount})
            setIsDiscountApplied(true);
            setShowDiscountField(true);
            setDiscount(100);
        } else if (lastDiscountFields.gift) {
            setLastDiscountFields(prevState => ({...prevState, gift: false}));
            setIsDiscountApplied(lastDiscountFields.isDiscountApplied);
            setShowDiscountField(lastDiscountFields.showDiscountField);
            setDiscount(lastDiscountFields.discount);
        }

        // eslint-disable-next-line
    }, [paymentStatus]);

    const handleToggleSummary = () => {
        setIsSummaryOpen(prevState => !prevState);
    };

    const handleConfirmOrder = () => {

        if (paymentStatus === '') {
            setPaymentStatusError('Lütfen ödeme durumunu seçiniz.');
            return;
        }
        setPaymentStatusError(false);

        const orderData = {
            orders,
            orderNote,
            paymentStatus,
            discount,
            discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            totalPrice: parseFloat(totalPrice.toFixed(2))
        }

        setIsLoading(true);
        sendSocketMessage(orderData,messageType);

    };

    const handleApplyDiscount = () => {
        setLastDiscountFields(prevState => ({...prevState, discount}));
        setIsDiscountApplied(true);
        setShowDiscountField(true);
    };

    const handleRemoveDiscount = () => {
        setIsDiscountApplied(false);
        setDiscount(0);
    };

    const totalPrice = calculateTotalPrice();
    const discountedPrice = totalPrice * (1 - discount / 100);

    const discountMarks = [
        {value: 0, label: '0%'},
        {value: 25, label: '25%'},
        {value: 50, label: '50%'},
        {value: 75, label: '75%'},
        {value: 100, label: '100%'},
    ];


    return (
        <Box
            sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#fff',
                padding: 2,
                borderTop: '1px solid #ddd',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 2,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 0.3s ease'
            }}
        >
            <Box sx={{position: 'relative', marginBottom: 2}}>
                <IconButton
                    onClick={handleToggleSummary}
                    sx={{
                        position: 'absolute',
                        top: isSummaryOpen ? 0 : 25,
                        left: 0,
                        zIndex: 3
                    }}
                >
                    {isSummaryOpen ? <ArrowDownwardIcon/> : <ArrowUpward/>}
                </IconButton>
                {isSummaryOpen && (
                    <Typography
                        variant="h6"
                        sx={{fontWeight: 600, color: '#333', marginBottom: 2, textAlign: 'center'}}
                    >
                        Sipariş Özeti
                    </Typography>
                )}
            </Box>

            {isSummaryOpen && (
                <>
                    <TextField
                        label="Sipariş Notu"
                        multiline
                        rows={2}
                        variant="outlined"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        sx={{marginBottom: 2}}
                    />

                    <FormControl variant="outlined" sx={{marginBottom: 2, minWidth: 120}} error={!!paymentStatusError}>
                        <InputLabel>Ödeme Durumu</InputLabel>
                        <Select
                            value={paymentStatus}
                            onChange={(e) => {
                                setPaymentStatus(e.target.value);
                                setPaymentStatusError(false);
                            }}
                            label="Ödeme Durumu"
                        >
                            <MenuItem value={PaymentStatusEnum.GIFT} disabled={!checkPermissions('ef', true)}>
                                {PaymentStatusEnum.GIFT}
                            </MenuItem>
                            <MenuItem value={PaymentStatusEnum.PAID} disabled={!checkPermissions('e')}>
                                {PaymentStatusEnum.PAID}
                            </MenuItem>
                            <MenuItem value={PaymentStatusEnum.PAY_LATER}>
                                {PaymentStatusEnum.PAY_LATER}
                            </MenuItem>
                        </Select>
                        {paymentStatusError && <FormHelperText>Ödeme durumu seçilmelidir.</FormHelperText>}
                    </FormControl>

                    {checkPermissions('f') && paymentStatus !== PaymentStatusEnum.GIFT && (<>
                        {!isDiscountApplied ? (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleApplyDiscount}
                                startIcon={<CheckCircleIcon/>}
                                sx={{marginBottom: 2}}
                            >
                                İndirim Uygula
                            </Button>
                        ) : (
                            <>
                                {showDiscountField && (
                                    <Box
                                        sx={{
                                            width: 0.7,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            mx: 'auto', // Orta konumlandırma için yatay margin ayarı
                                            mb: 2
                                        }}
                                    >
                                        <Slider
                                            aria-label="Small steps"
                                            defaultValue={lastDiscountFields.discount}
                                            onChange={(e, newValue) => setDiscount(newValue)}
                                            step={5}
                                            min={0}
                                            max={100}
                                            valueLabelDisplay="auto"
                                            marks={discountMarks}
                                            sx={{width: '100%'}} // Slider genişliğini Box genişliğine göre ayarla
                                        />
                                    </Box>
                                )}
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleRemoveDiscount}
                                    startIcon={<CancelIcon/>}
                                    sx={{marginBottom: 2}}
                                >
                                    İndirimi Kaldır
                                </Button>
                            </>
                        )}
                    </>)}
                </>
            )}

            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                <Box sx={{textAlign: 'center', marginBottom: 1}}>
                    <Typography
                        variant="h6"
                        sx={{fontWeight: 600, color: '#333'}}
                    >
                        Toplam Fiyat
                    </Typography>
                    {isDiscountApplied ? (
                        <>
                            <Typography
                                variant="h5"
                                sx={{fontWeight: 700, color: '#000'}}
                            >
                                {discountedPrice.toFixed(2)} ₺
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{color: '#999', textDecoration: 'line-through', fontSize: '0.875rem'}}
                            >
                                {totalPrice.toFixed(2)} ₺
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            variant="h5"
                            sx={{fontWeight: 700, color: '#000'}}
                        >
                            {totalPrice.toFixed(2)} ₺
                        </Typography>
                    )}
                </Box>
                {isSummaryOpen && (
                    <LoadingButton
                        variant="contained"
                        loading={isLoading}
                        loadingPosition="start"
                        startIcon={<PlaylistAddCheckIcon/>}
                        onClick={handleConfirmOrder}
                    >
                        Siparişi Onayla
                    </LoadingButton>
                )}
            </Box>
        </Box>
    );
};

export default OrderSummary;
