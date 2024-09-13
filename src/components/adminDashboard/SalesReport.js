import React, {useContext, useEffect, useState} from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Grid,
    Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DataRangeSelector from '../DataRangeSelector';
import {SocketContext} from '../../context/SocketContext';
import {axisClasses} from '@mui/x-charts/ChartsAxis';
import {chartsGridClasses} from '@mui/x-charts/ChartsGrid';
import {BarChart} from '@mui/x-charts/BarChart';

function formatDateToCustomFormat(dateString) {
    // Tarih nesnesi oluştur
    const date = new Date(dateString);

    // Format seçeneklerini ayarla
    const options = {
        day: 'numeric',
        month: 'long',
        weekday: 'long' // Haftanın gününü ekler
    };

    // Tarihi belirtilen formatta döndür
    return new Intl.DateTimeFormat('tr-TR', options).format(date);
}

export default function SalesReport() {
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const getSalesMessageType = 'getSales';
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);

    const analyzeSales = (sales) => {
        let salesData = sales || [];

        const totalSalesAmount = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);
        const totalOrdersCount = salesData.reduce((acc, sale) => acc + sale.quantity, 0);

        setTotalSales(totalSalesAmount);
        setTotalOrders(totalOrdersCount);

        // Calculate top products
        const productSales = salesData.reduce((acc, sale) => {
            if (!acc[sale.productName]) {
                acc[sale.productName] = {amount: 0, sales: 0};
            }
            acc[sale.productName].amount += sale.quantity;
            acc[sale.productName].sales += sale.totalPrice;
            return acc;
        }, {});

        const topProductsData = Object.keys(productSales).map(productName => ({
            name: productName,
            amount: productSales[productName].amount,
            sales: productSales[productName].sales
        }));

        setTopProducts(topProductsData);

        // Prepare data for the chart
        const chartData = salesData.reduce((acc, sale) => {
            const date = formatDateToCustomFormat(sale.createdDate);

            if (!acc[date]) {
                acc[date] = {date, sales: 0};
            }
            acc[date].sales += sale.totalPrice;
            return acc;
        }, {});

        setSalesData(Object.values(chartData));
    };

    useEffect(() => {
        if (!socketData || !socketData.message) return;

        if (socketData.type === getSalesMessageType) {
            if (socketData.message.status === "success" && socketData.message.sales) {
                analyzeSales(socketData.message.sales);
            }
        }

        // eslint-disable-next-line
    }, [socketData]);

    const changeDataRange = (dateRange) => {
        sendSocketMessage(dateRange, getSalesMessageType);
    };

    const avgOrderValue = totalOrders === 0 ? 0 : (totalSales / totalOrders).toFixed(2);

    return (
        <Box sx={{width: '100%', padding: 2, backgroundColor: '#f4f6f8'}}>
            {/* DataRangeSelector Component */}
            <Box sx={{display: 'flex', justifyContent: 'center', mb: 4}}>
                <DataRangeSelector changeDataRange={changeDataRange}/>
            </Box>

            <Divider sx={{my: 4}}/>

            {/* Info Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <TrendingUpIcon fontSize="large"/>
                                <Box ml={2}>
                                    <Typography variant="h6">Toplam Satış</Typography>
                                    <Typography variant="h4" fontWeight="bold">₺{totalSales.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <ShoppingCartIcon fontSize="large"/>
                                <Box ml={2}>
                                    <Typography variant="h6">Toplam Sipariş</Typography>
                                    <Typography variant="h4" fontWeight="bold">{totalOrders}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <ReceiptLongIcon fontSize="large"/>
                                <Box ml={2}>
                                    <Typography variant="h6">Ort. Sipariş Değeri</Typography>
                                    <Typography variant="h4" fontWeight="bold">₺{avgOrderValue}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{my: 4}}/>

            {/* Sales Graph */}
            {salesData.length > 1 && (
                <Card sx={{mb: 4}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Son 30 Gün Satış Grafiği</Typography>
                        <div style={{width: '100%', height: 300}}>
                            <BarChart
                                dataset={salesData}
                                xAxis={[{scaleType: 'band', dataKey: 'date'}]}
                                yAxis={[{label: 'Satış (₺)'}]}
                                series={[{dataKey: 'sales', label: 'Satış'}]}
                                grid={{horizontal: true}}
                                sx={{
                                    [`& .${axisClasses.left} .${axisClasses.label}`]: {
                                        transform: 'translateX(-10px)',
                                    },
                                    [`& .${chartsGridClasses.line}`]: {strokeDasharray: '5 3', strokeWidth: 2},
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Selling Products */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>En Çok Satan Ürünler</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ürün Adı</TableCell>
                                <TableCell>Adet</TableCell>
                                <TableCell>Brüt Satış (₺)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.amount}</TableCell>
                                    <TableCell>₺{product.sales.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}