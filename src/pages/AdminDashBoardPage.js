import React, {useContext, useState} from 'react';
import { Container, Tabs, Tab, Box, Typography, Paper, useMediaQuery } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTheme } from '@mui/material/styles';

import UserManagement from '../components/adminDashboard/UserManagement';
import ProductManager from '../components/adminDashboard/ProductManager';
import {AccountContext} from "../context/AccountContext";
import SalesReport from "../components/adminDashboard/SalesReport";

function AdminDashboard() {
    const {checkPermissions} = useContext(AccountContext);
    const [selectedTab, setSelectedTab] = useState(2);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSysAdmin = checkPermissions("a");
    const isProductManager = checkPermissions("b");
    const isReportViewer = checkPermissions("c");

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const renderContent = () => {
        switch (selectedTab) {
            case 0:
                return <UserManagement />;
            case 1:
                return <ProductManager />;
            case 2:
                return <SalesReport/>;
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography
                variant={isMobile ? "h5" : "h4"}
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
                    <Tab disabled={!isSysAdmin} icon={<PeopleIcon />} label="Kullanıcı Yönetimi" />
                    <Tab disabled={!isProductManager} icon={<InventoryIcon />} label="Ürün Yönetimi" />
                    <Tab disabled={!isReportViewer} icon={<AssessmentIcon />} label="Satış Raporları" />

                </Tabs>
            </Paper>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start', // Mobilde merkezde hizala
                    justifyContent: 'center',
                    borderRadius: 2,
                    boxShadow: 2,
                    backgroundColor: '#fff',
                    mt: isMobile ? 2 : 0,
                }}
            >
                {renderContent()}
            </Box>
        </Container>
    );
}

export default AdminDashboard;
