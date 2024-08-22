import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography, Button, Paper, useMediaQuery } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTheme } from '@mui/material/styles';

function AdminDashboard() {
    const [selectedTab, setSelectedTab] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography
                variant={isMobile ? "h5" : "h4"}  // Başlığı mobilde biraz daha küçük yapıyoruz
                gutterBottom
                sx={{ fontWeight: 'bold', textAlign: 'center' }}
            >
                Yönetici Kontrol Paneli
            </Typography>
            <Paper elevation={3} sx={{ mb: 4 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered={!isMobile}
                    orientation={isMobile ? 'vertical' : 'horizontal'}
                    variant={isMobile ? 'scrollable' : 'fullWidth'}
                    sx={{
                        backgroundColor: '#f5f5f5',
                        '& .MuiTab-root': {
                            minWidth: isMobile ? 1 : 150,
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            margin: isMobile ? '8px 0' : '0 20px',
                            textTransform: 'capitalize', // Yalnızca ilk harf büyük olacak şekilde
                        },
                    }}
                >
                    <Tab icon={<PeopleIcon />} label="Kullanıcı Yönetimi" />
                    <Tab icon={<InventoryIcon />} label="Ürün Yönetimi" />
                    <Tab icon={<AssessmentIcon />} label="Satış Raporları" />
                </Tabs>
            </Paper>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start', // Mobilde merkezde hizala
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: '#fff',
                    mt: isMobile ? 2 : 0,
                }}
            >
                {selectedTab === 0 && (
                    <Box textAlign="center" sx={{ width: '100%', maxWidth: 400 }}>
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            gutterBottom
                            sx={{ fontWeight: 'medium' }}
                        >
                            Kullanıcı Yönetimi
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{
                                mt: 2,
                                px: 4,
                                py: 1.5,
                                boxShadow: 3,
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                fontWeight: 'bold',
                            }}
                        >
                            Yönet
                        </Button>
                    </Box>
                )}
                {selectedTab === 1 && (
                    <Box textAlign="center" sx={{ width: '100%', maxWidth: 400 }}>
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            gutterBottom
                            sx={{ fontWeight: 'medium' }}
                        >
                            Ürün Yönetimi
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                mt: 2,
                                px: 4,
                                py: 1.5,
                                boxShadow: 3,
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                fontWeight: 'bold',
                            }}
                        >
                            Yönet
                        </Button>
                    </Box>
                )}
                {selectedTab === 2 && (
                    <Box textAlign="center" sx={{ width: '100%', maxWidth: 400 }}>
                        <Typography
                            variant={isMobile ? "h6" : "h5"}
                            gutterBottom
                            sx={{ fontWeight: 'medium' }}
                        >
                            Satış Raporları
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                mt: 2,
                                px: 4,
                                py: 1.5,
                                boxShadow: 3,
                                backgroundColor: '#ff9800',
                                color: '#fff',
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                fontWeight: 'bold',
                            }}
                        >
                            Görüntüle
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default AdminDashboard;
