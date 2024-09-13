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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DataRangeSelector from '../DataRangeSelector';
import {useContext, useEffect} from "react";
import {SocketContext} from "../../context/SocketContext";

const data = [
    { date: '14 Ağu', sales: 4000 },
    { date: '17 Ağu', sales: 3000 },
    { date: '20 Ağu', sales: 2000 },
    { date: '26 Ağu', sales: 2780 },
    { date: '29 Ağu', sales: 1890 },
    { date: '1 Eyl', sales: 2390 },
    { date: '4 Eyl', sales: 3490 },
];

const topProducts = [
    { name: 'Köy tereyağı', amount: 12, percentage: 20, sales: 4200 },
    { name: 'Çörekotu yağı', amount: 6, percentage: 7, sales: 1500 },
    { name: 'Biber salçası', amount: 4, percentage: 5, sales: 1120 },
    { name: 'Domates salçası', amount: 7, percentage: 4, sales: 875 },
    { name: 'Peynir', amount: 3, percentage: 4, sales: 840 },
];

export default function SalesReport() {
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const getSalesMessageType = 'getSales';

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if (socketData.type === getSalesMessageType) {
            if (socketData.message.status === "success" && socketData.message.sales) {
                console.log(socketData.message)
            }

        }

        // eslint-disable-next-line
    }, [socketData]);

    const changeDataRange = (dateRange) => {
        sendSocketMessage(dateRange,getSalesMessageType);
    }

    return (
        <Box sx={{ width: '100%', padding: 2, backgroundColor: '#f4f6f8' }}>
            {/* DataRangeSelector Component */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <DataRangeSelector changeDataRange={changeDataRange} />
            </Box>

            <Divider sx={{ my: 4 }} />

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
                                <TrendingUpIcon fontSize="large" />
                                <Box ml={2}>
                                    <Typography variant="h6">Toplam Satış</Typography>
                                    <Typography variant="h4" fontWeight="bold">₺22,729</Typography>
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
                                <ShoppingCartIcon fontSize="large" />
                                <Box ml={2}>
                                    <Typography variant="h6">Toplam Sipariş</Typography>
                                    <Typography variant="h4" fontWeight="bold">16</Typography>
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
                                <ReceiptLongIcon fontSize="large" />
                                <Box ml={2}>
                                    <Typography variant="h6">Ort. Sipariş Değeri</Typography>
                                    <Typography variant="h4" fontWeight="bold">₺1,421</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Sales Graph */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Son 30 Gün Satış Grafiği</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#3f51b5" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>En Çok Satan Ürünler</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ürün Adı</TableCell>
                                <TableCell>Adet</TableCell>
                                <TableCell>Toplamın %'si</TableCell>
                                <TableCell>Brüt Satış (₺)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.amount}</TableCell>
                                    <TableCell>{product.percentage}%</TableCell>
                                    <TableCell>₺{product.sales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}
