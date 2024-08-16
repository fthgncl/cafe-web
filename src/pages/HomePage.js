import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <Container sx={{display:'flex',justifyContent:'center',mt:10}}>
            <Button variant="contained" component={Link} to="/create-user" sx={{ margin: '8px' }}>
                Kullanıcı Oluştur
            </Button>
            <Button variant="contained" component={Link} to="/create-product" sx={{ margin: '8px' }}>
                Ürün Oluştur
            </Button>
            <Button variant="contained" component={Link} to="/order-entry" sx={{ margin: '8px' }}>
                Sipariş Ekle
            </Button>
            <Button variant="contained" component={Link} to="/orders" sx={{ margin: '8px' }}>
                Siparişler
            </Button>
        </Container>
    );
}
