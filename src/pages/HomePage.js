import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AddCircle, AddShoppingCart, List, Settings } from '@mui/icons-material';

const boxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '160px',
    height: '160px',
    margin: '12px',
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
    '@media (max-width:600px)': {
        width: '120px',
        height: '120px',
        margin: '8px',
    },
    '@media (max-width:400px)': {
        width: '100px',
        height: '100px',
        margin: '4px',
    },
};

const iconStyle = {
    fontSize: '40px',
    color: '#1976d2',
    '@media (max-width:600px)': {
        fontSize: '32px',
    },
    '@media (max-width:400px)': {
        fontSize: '28px',
    },
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
                to="/create-product"
                sx={boxStyle}
            >
                <AddCircle sx={iconStyle} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Ürün Oluştur
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/order-entry"
                sx={boxStyle}
            >
                <AddShoppingCart sx={iconStyle} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Sipariş Ekle
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/orders"
                sx={boxStyle}
            >
                <List sx={iconStyle} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Siparişler
                </Typography>
            </Box>
            <Box
                component={Link}
                to="/admin-dashboard"
                sx={boxStyle}
            >
                <Settings sx={iconStyle} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Yönetim Merkezi
                </Typography>
            </Box>
        </Container>
    );
}
