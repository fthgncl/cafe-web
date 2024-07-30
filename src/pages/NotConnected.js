import React from 'react';
import { Container, Typography, Button, Box, LinearProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ConnectionErrorPage = () => {

    const handleReload = () => {
        window.location.reload();
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
                <Typography
                    variant="h4"
                    gutterBottom
                    align="center"
                >
                    Bağlantı Hatası
                </Typography>
                <Typography
                    variant="body1"
                    gutterBottom
                    align="center"
                >
                    Şu anda sunucuya ulaşılamıyor.
                </Typography>
                <Typography
                    variant="body1"
                    gutterBottom
                    align="center"
                >
                    Yeniden bağlanılmaya çalışılıyor.
                </Typography>
                <Box
                    sx={{
                        width: '100%',
                        mt: 2,
                        mb: 2,
                    }}
                >
                    <LinearProgress />
                </Box>
                <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                >
                    Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReload}
                    sx={{ display: 'flex', alignItems: 'center', mt: 2 }}
                >
                    <RefreshIcon sx={{ mr: 1 }} />
                    Yenile
                </Button>
            </Box>
        </Container>
    );
};

export default ConnectionErrorPage;
