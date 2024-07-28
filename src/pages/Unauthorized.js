import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import {useNavigate} from "react-router-dom";

const UnauthorizedPage = () => {

    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Yetkisiz Erişim
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Bu sayfayı görüntülemek için izniniz yok
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRedirect}
                    sx={{ mt: 5 }}
                >
                    Ana Sayfaya Dön
                </Button>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;
