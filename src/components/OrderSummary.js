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

const OrderSummary = ({orders, calculateTotalPrice}) => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(true);
    const [orderNote, setOrderNote] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paymentStatusError, setPaymentStatusError] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [showDiscountField, setShowDiscountField] = useState(false);
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const { checkPermissions } = useContext(AccountContext);
    const PaymentStatusEnum = Object.freeze({
        GIFT: 'Hediye',
        PAID: 'Ödendi',
        PAY_LATER: 'Daha Sonra Ödenecek'
    });

    useEffect(() => {
        if (paymentStatus === PaymentStatusEnum.GIFT) {
            setIsDiscountApplied(true);
            setShowDiscountField(true);
            setDiscount(100);
        }
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

    };

    const handleApplyDiscount = () => {
        setIsDiscountApplied(true);
        setShowDiscountField(true);
    };

    const handleRemoveDiscount = () => {
        setIsDiscountApplied(false);
        setDiscount(0);
    };

    const totalPrice = calculateTotalPrice();
    const discountedPrice = totalPrice * (1 - discount / 100);

    const changeDiscount = discount => {
        setDiscount(discount);
    }

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
                        { paymentStatusError && <FormHelperText>Ödeme durumu seçilmelidir.</FormHelperText>}
                    </FormControl>

                    { checkPermissions('f') && paymentStatus !== PaymentStatusEnum.GIFT && (<>
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
                                            defaultValue={10}
                                            getAriaValueText={changeDiscount}
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmOrder}
                    >
                        Siparişi Onayla
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default OrderSummary;
