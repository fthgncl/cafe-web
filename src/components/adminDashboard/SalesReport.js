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
import DiscountIcon from '@mui/icons-material/Discount';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import TimelineIcon from '@mui/icons-material/Timeline';
import DataRangeSelector from '../DataRangeSelector';
import {SocketContext} from '../../context/SocketContext';
import {axisClasses} from '@mui/x-charts/ChartsAxis';
import {chartsGridClasses} from '@mui/x-charts/ChartsGrid';
import {BarChart} from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart'

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
    const [totalSales, setTotalSales] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalSalesProducts, setTotalSalesProducts] = useState(0);
    const [topProducts, setTopProducts] = useState([]);
    const [topProfitableProducts, setTopProfitableProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const getSalesMessageType = 'getAnalyticsData';

    const analyzeOrdersData = (data) => {
        setOrderCount(data.orderCount || 0);
        const salesData = data.sales || [];

        const totalSalesAmount = salesData.reduce((acc, sale) => acc + sale.totalPrice * sale.quantity, 0);
        const totalDisc = salesData.reduce((acc, sale) => acc + (sale.totalPrice - sale.discountedPrice) * sale.quantity, 0);
        const totalSalesProducts = salesData.reduce((acc, sale) => acc + sale.quantity, 0);

        setTotalDiscount(totalDisc);
        setTotalSales(totalSalesAmount);
        setTotalSalesProducts(totalSalesProducts);

        // Calculate top products
        const productSales = salesData.reduce((acc, sale) => {
            if (!acc[sale.productName]) {
                acc[sale.productName] = {amount: 0, sales: 0};
            }
            acc[sale.productName].amount += sale.quantity;
            acc[sale.productName].sales += sale.totalPrice;
            return acc;
        }, {});

        const productsData = Object.keys(productSales).map(productName => ({
            name: productName,
            amount: productSales[productName].amount,
            sales: productSales[productName].sales
        }));

        setTopProducts([...productsData].sort((a, b) => b.amount - a.amount));
        setTopProfitableProducts([...productsData].sort((a, b) => b.sales - a.sales));

        // Prepare data for the chart
        const chartData = salesData.reduce((acc, sale) => {
            const date = formatDateToCustomFormat(sale.createdDate);

            if (!acc[date]) {
                acc[date] = {date, sales: 0, discount: 0};
            }
            acc[date].sales += sale.totalPrice;
            acc[date].discount += sale.totalPrice - sale.discountedPrice;
            return acc;
        }, {});

        setSalesData(Object.values(chartData));
    };

    useEffect(() => {
        if (!socketData || !socketData.message) return;

        if (socketData.type === getSalesMessageType) {
            if (socketData.message.status === "success" && socketData.message.data) {
                analyzeOrdersData(socketData.message.data);
            }
        }

        // eslint-disable-next-line
    }, [socketData]);

    const changeDataRange = (dateRange) => {
        sendSocketMessage(dateRange, getSalesMessageType);
    };

    const avgSalesProductValue = totalSalesProducts === 0 ? 0 : (totalSales / totalSalesProducts).toFixed(0);
    const avgOrderValue = orderCount === 0 ? 0 : (totalSales / orderCount).toFixed(0);

    const tableStyles = {
        productCell: {
            width: '40%',  // Ürün adının bulunduğu hücre geniş olacak
            textAlign: 'left'
        },
        amountCell: {
            width: '30%',  // Adet için orta genişlik
            textAlign: 'center'
        },
        salesCell: {
            width: '30%',  // Satış bilgisi için orta genişlik
            textAlign: 'right'
        }
    };

    return (
        <Box sx={{width: '100%', padding: 2, backgroundColor: '#f4f6f8'}}>
            {/* DataRangeSelector Component */}
            <Box sx={{display: 'flex', justifyContent: 'center', mb: 4}}>
                <DataRangeSelector changeDataRange={changeDataRange}/>
            </Box>

            <Divider sx={{my: 4}}/>

            {/* Info Cards */}
            <Grid container spacing={3}>
                <StatisticCard Icon={TrendingUpIcon} title={'Toplam Satış'} data={totalSales.toFixed(0)} symbol={'₺'} color={'#2196f3'} />
                <StatisticCard Icon={DiscountIcon} title={'Toplam İndirim'} data={totalDiscount.toFixed(0)} symbol={'₺'} color={'#9b27af'} />
                <StatisticCard Icon={ShoppingCartIcon} title={'Toplam Sipariş'} data={orderCount} color={'#4caf50'} />
                <StatisticCard Icon={EmojiFoodBeverageIcon} title={'Toplam Satılan Ürün'} data={totalSalesProducts} color={'#AF4C57'} />
                <StatisticCard Icon={TimelineIcon} title={'Ort. Ürün Değeri'} data={avgSalesProductValue} symbol={'₺'} color={'#DB7C24'} />
                <StatisticCard Icon={TimelineIcon} title={'Ort. Sipariş Değeri'} data={avgOrderValue} symbol={'₺'} color={'#ffc400'} />
            </Grid>

            <Divider sx={{my: 4}}/>

            {/* Sales Graph */}
            <Card sx={{mb: 4}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Satış Grafiği</Typography>
                    <div style={{width: '100%', height: 300}}>
                        <BarChart
                            dataset={salesData}
                            xAxis={[{scaleType: 'band', dataKey: 'date'}]}
                            yAxis={[{label: 'Satış (₺)'}]}
                            series={[
                                {dataKey: 'sales', label: 'Satış', color:'#2196f3', valueFormatter: (value) => (value === null ? '' : `${value} ₺`),},
                                {dataKey: 'discount', label: 'İndirim', color:'#9b27af', valueFormatter: (value) => (value === null ? '' : `${value} ₺`),}
                            ]}
                            grid={{horizontal: true}}
                            sx={{
                                [`& .${axisClasses.left} .${axisClasses.label}`]: {
                                    transform: 'translateX(-10px)',
                                },
                                [`& .${chartsGridClasses.line}`]: {strokeDasharray: '5 3', strokeWidth: 2},
                            }}
                            barLabel={(item, context) => context.bar.height < 30 || context.bar.width < 60 ? null : `${item.value} ₺` }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>En Çok Satan Ürünler</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={tableStyles.productCell}>Ürün Adı</TableCell>
                                <TableCell style={tableStyles.amountCell} sx={{fontWeight: 'bold'}}>Adet</TableCell>
                                <TableCell style={tableStyles.salesCell}>Brüt Satış (₺)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell style={tableStyles.productCell}>{product.name}</TableCell>
                                    <TableCell style={tableStyles.amountCell} sx={{fontWeight: 'bold'}}>{product.amount}</TableCell>
                                    <TableCell style={tableStyles.salesCell}>₺{product.sales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Most Profitable Products */}
            <Card sx={{my: 4}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>En Çok Kazandıran Ürünler</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={tableStyles.productCell}>Ürün Adı</TableCell>
                                <TableCell style={tableStyles.amountCell}>Adet</TableCell>
                                <TableCell style={tableStyles.salesCell} sx={{fontWeight: 'bold'}} >Brüt Satış (₺)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProfitableProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell style={tableStyles.productCell}>{product.name}</TableCell>
                                    <TableCell style={tableStyles.amountCell}>{product.amount}</TableCell>
                                    <TableCell style={tableStyles.salesCell} sx={{fontWeight: 'bold'}} >₺{product.sales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card sx={{ my: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                    {/* Grafiklerin Grid ile hizalanması ve alt satıra geçince ortalanması */}
                    <Grid container spacing={3} justifyContent="center" alignItems="center">
                        {/* En Çok Satan Ürünler Grafiği */}
                        <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" gutterBottom>
                                En Çok Satan Ürünler
                            </Typography>
                            <PieChart
                                series={[
                                    {
                                        data: topProducts.map((product, index) => ({
                                            id: index,
                                            value: product.amount,
                                            label: product.name,
                                        })),
                                        highlightScope: { fade: 'global', highlight: 'item' },
                                        innerRadius: 30,
                                        outerRadius: 100,
                                        paddingAngle: 3,
                                        cornerRadius: 5,
                                        startAngle: -45,
                                        endAngle: 315,
                                        valueFormatter: ({value}) => (value === null ? '' : `${value} adet`),
                                    },
                                ]}
                                width={400}
                                height={200}
                            />
                        </Grid>

                        {/* En Çok Kazandıran Ürünler Grafiği */}
                        <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" gutterBottom>
                                En Çok Kazandıran Ürünler
                            </Typography>
                            <PieChart
                                series={[
                                    {
                                        data: topProducts.map((product, index) => ({
                                            id: index,
                                            value: product.sales,
                                            label: product.name,
                                        })),
                                        highlightScope: { fade: 'global', highlight: 'item' },
                                        arcLabelMinAngle: 35,
                                        innerRadius: 30,
                                        outerRadius: 100,
                                        paddingAngle: 3,
                                        cornerRadius: 5,
                                        startAngle: -45,
                                        endAngle: 315,
                                        valueFormatter: ({value}) => (value === null ? '' : `${value} ₺`),
                                    },
                                ]}
                                width={400}
                                height={200}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>




        </Box>
    );
}

function StatisticCard({Icon, title, data, color, symbol}){
    return (
        <Grid item xs={12} sm={4}>
            <Card sx={{
                backgroundColor: color,
                color: 'white',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
            }}>
                <CardContent>
                    <Box display="flex" alignItems="center">
                        <Icon fontSize="large"/>
                        <Box ml={2}>
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="h4" fontWeight="bold">{symbol}{data}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}