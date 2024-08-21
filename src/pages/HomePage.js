import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { PersonAdd, AddCircle, AddShoppingCart, List, Analytics } from '@mui/icons-material';

const boxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    height: '200px',
    margin: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    textDecoration: 'none',
    backgroundColor: '#fff',
    '&:hover': {
        backgroundColor: '#f5f5f5',
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
    },
};

const iconStyle = {
    fontSize: '48px',
    color: '#1976d2',
};

export default function HomePage() {
    return (
        <Container
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                mt: 10
            }}
        >
            <Box
                component={Link}
                to="/create-user"
                sx={boxStyle}
            >
                <PersonAdd sx={iconStyle} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Kullanıcı Oluştur
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/create-product"
                sx={boxStyle}
            >
                <AddCircle sx={iconStyle} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Ürün Oluştur
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/order-entry"
                sx={boxStyle}
            >
                <AddShoppingCart sx={iconStyle} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Sipariş Ekle
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/orders"
                sx={boxStyle}
            >
                <List sx={iconStyle} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Siparişler
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/sales-stats"
                sx={boxStyle}
            >
                <Analytics sx={iconStyle} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Satış İstatistikleri
                </Typography>
            </Box>
        </Container>
    );
}
