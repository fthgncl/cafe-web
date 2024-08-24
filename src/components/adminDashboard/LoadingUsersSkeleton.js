import {
    Box,
    Card,
    CardContent,
    CardHeader,
    useMediaQuery,
    useTheme,
    Skeleton,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import React from "react";

export default function LoadingCardSkeleton() {

    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    return (
        <Box
            sx={{
                width: '100%',
                padding: '20px',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
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
                            <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
                            <Skeleton variant="text" width={120} height={30} />
                        </CardContent>
                    </Card>
                </div>

                {Array.from({ length: getRandomInt(3,6) }, (_, index) => (
                    <div key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                            <CardHeader
                                avatar={<Skeleton variant="circular" width={40} height={40} />}
                                title={<Skeleton variant="text" width="60%" />}
                                subheader={<Skeleton variant="text" width="40%" />}
                                action={
                                    <Skeleton variant="circular" width={40} height={40} />
                                }
                            />
                            <CardContent>
                                <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
                                <Divider sx={{ my: 1 }} />
                                <Skeleton variant="text" width="50%" sx={{ mb: 2 }} />
                                <List dense>
                                    {Array.from({ length: getRandomInt(3,7) }).map((_, index) => (
                                        <ListItem key={index} disableGutters>
                                            <ListItemIcon>
                                                <Skeleton variant="circular" width={24} height={24} />
                                            </ListItemIcon>
                                            <ListItemText primary={<Skeleton variant="text" width="80%" />} />
                                        </ListItem>
                                    ))}
                                </List>
                                <Divider sx={{ my: 1 }} />
                                <Skeleton variant="text" width="60%" />
                            </CardContent>

                            {/* Üç noktalı menü */}
                            <Menu
                                anchorEl={null}
                                open={false}
                                onClose={() => {}}
                                PaperProps={{
                                    sx: {
                                        boxShadow: 3,
                                        borderRadius: 1,
                                        minWidth: 150,
                                        mt: 1,
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                    },
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem>
                                    <Skeleton variant="text" width="70%" />
                                </MenuItem>
                                <MenuItem>
                                    <Skeleton variant="text" width="70%" />
                                </MenuItem>
                            </Menu>
                        </Card>
                    </div>
                ))}
            </Masonry>
        </Box>
    );
}
