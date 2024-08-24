import {
    Box,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    Skeleton,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoIcon from "@mui/icons-material/Info";
import React from "react";

export default function LoadingProductsSkeleton() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return (
        <Box
            sx={{
                width: "100%",
                padding: "20px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                minHeight: "100vh",
            }}
        >
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={isMobile ? 2 : 3}>
                <div>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            alignItems: "center",
                            justifyContent: 'center',
                            height: '200px',
                            cursor: 'pointer',
                            backgroundColor: theme.palette.background.paper,
                            border: `2px dashed ${theme.palette.primary.main}`,
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", display:'flex', flexDirection:'column' ,alignItems:'center' }}>
                            {/* Skeleton for Ürün Ekle */}
                            <Skeleton variant="rectangular" width={60} height={60} sx={{ marginBottom: 2 }} />
                            <Skeleton variant="text" width={100} />
                        </CardContent>
                    </Card>
                </div>

                {Array.from({ length: getRandomInt(3,7) }, (_, index) => (
                    <div key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2, height: "100%" }}>
                            <CardHeader
                                title={<Skeleton variant="text" width="60%" />}
                                subheader={<Skeleton variant="text" width="40%" />}
                                action={
                                    <IconButton aria-label="daha fazla seçenek" sx={{ padding: "10px" }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                            />
                            <CardContent>
                                {/* Skeleton for Boyutlar ve Fiyatlar Başlığı */}
                                <Skeleton variant="text" width="40%" sx={{ marginBottom: 2 }} />

                                <Box
                                    sx={{
                                        width: 1,
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                        justifyContent: "center",
                                        mb: 2,
                                    }}
                                >
                                    {Array.from({ length: getRandomInt(0,5) }).map((_, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                bgcolor: "primary.light",
                                                color: "white",
                                                borderRadius: "5px",
                                                display: "flex",
                                                justifyContent: "space-around",
                                                width: 80,
                                                height: 30,
                                            }}
                                        >
                                            <Skeleton variant="rectangular" width="100%" height="100%" />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Skeleton for İçerikler Başlığı */}
                                <Skeleton variant="text" width="30%" sx={{ marginBottom: 2 }} />

                                <List dense>
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <ListItem key={index} disableGutters>
                                            <ListItemIcon>
                                                <InfoIcon fontSize="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Skeleton variant="text" width="80%" />}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </Masonry>
        </Box>
    );
}
