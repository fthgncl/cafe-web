import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const OrderSummary = ({ orders, calculateOrderPrice , calculateTotalPrice}) => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(true); // Başlangıçta büyük form açık
    const [orderNote, setOrderNote] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    const handleToggleSummary = () => {
        setIsSummaryOpen(prevState => !prevState);
    };

    const handleConfirmOrder = () => {
        if (!paymentStatus) {
            alert('Lütfen ödeme durumunu seçiniz.');
        } else {
            alert('Siparişiniz başarıyla onaylandı!');
            // Siparişi onaylama işlemleri buraya eklenecek
        }
    };

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
                height: 'auto', // Küçük form yüksekliği
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 0.3s ease'
            }}
        >
            <Box sx={{ position: 'relative', marginBottom: 2 }}>
                <IconButton
                    onClick={handleToggleSummary}
                    sx={{
                        position: 'absolute',
                        top: isSummaryOpen ? 0 : 25,
                        left: 0,
                        zIndex: 3
                    }}
                >
                    {isSummaryOpen ? <ArrowDownwardIcon /> : <ArrowUpward />}
                </IconButton>
                {isSummaryOpen && (
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: '#333', marginBottom: 2, textAlign: 'center' }}
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
                        sx={{ marginBottom: 2 }}
                    />

                    <FormControl variant="outlined" sx={{ marginBottom: 2, minWidth: 120 }}>
                        <InputLabel>Ödeme Durumu</InputLabel>
                        <Select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            label="Ödeme Durumu"
                        >
                            <MenuItem value="Hediye">Hediye</MenuItem>
                            <MenuItem value="Ödendi">Ödendi</MenuItem>
                            <MenuItem value="Daha Sonra Ödenecek">Daha Sonra Ödenecek</MenuItem>
                        </Select>
                    </FormControl>
                </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', alignItems: 'center' }}>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: '#333' }}
                    >
                        Toplam Fiyat
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#000' }}
                    >
                        {calculateTotalPrice().toFixed(2)} ₺
                    </Typography>
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
