import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../context/SocketContext";
import {systemPermissions} from '../../config'; // İzin kodlarını ve açıklamalarını içeren değişkeni import ediyoruz.
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Avatar,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {deepPurple} from '@mui/material/colors';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// İzin kodlarını açıklamalara dönüştüren fonksiyon
const getPermissionsDescriptions = (permissions, isAdmin) => {
    // Eğer kullanıcı sistem yöneticisiyse (a kodu) tüm izinleri göster
    if (isAdmin) {
        return Object.values(systemPermissions).map(perm => perm.description);
    }

    // İzin kodlarını açıklamalara dönüştürelim
    if (!permissions) return ["Yetki Yok"];

    return permissions.split('').map(code => {
        const permission = Object.values(systemPermissions).find(perm => perm.code === code);
        return permission ? permission.description : `Bilinmeyen Yetki Kodu: ${code}`;
    });
};

// Tarih formatını düzenleyen fonksiyon
const formatDate = (dateString) => {
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    return new Date(dateString).toLocaleDateString('tr-TR', options);
};

export default function UserManagement() {
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const getUsersMessageType = 'getUsers';

    // Temayı ve mobil uyumlu tasarımı kontrol et
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        sendSocketMessage({}, getUsersMessageType);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (socketData && socketData.type === getUsersMessageType) {
            console.log(socketData);
            if (socketData.message && socketData.message.status === "success") {
                setUsers(socketData.message.users);
            }
        }
    }, [socketData]);

    const handleClick = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setCurrentUserId(userId);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentUserId(null);
    };

    const handleEditClick = () => {
        console.log(`Kullanıcıyı düzenle: ${currentUserId}`);
        handleClose();
    };

    const handleDeleteClick = () => {
        console.log(`Kullanıcıyı sil: ${currentUserId}`);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-menu' : undefined;

    return (
        <Box sx={{width: '100%', padding: '20px', boxSizing: 'border-box'}}>
            <Grid container spacing={isMobile ? 2 : 3}>
                {users.map((user) => {
                    // Kullanıcının sistem yöneticisi olup olmadığını kontrol et
                    const isAdmin = user.permissions.includes('a');

                    return (
                        <Grid item xs={12} sm={6} md={4} key={user._id}>
                            <Card variant="outlined" sx={{borderRadius: 2, boxShadow: 3}}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{bgcolor: deepPurple[500], width: 40, height: 40}}>
                                            {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                        </Avatar>
                                    }
                                    title={<Typography variant="h6"
                                                       noWrap>{`${user.firstname} ${user.lastname}`}</Typography>}
                                    subheader={<Typography variant="body2"
                                                           color="textSecondary">{`Kullanıcı Adı: ${user.username}`}</Typography>}
                                    action={
                                        <IconButton
                                            aria-label="daha fazla seçenek"
                                            onClick={(event) => handleClick(event, user._id)}
                                            sx={{padding: '10px'}}
                                        >
                                            <MoreVertIcon/>
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        <strong>Telefon:</strong> {user.phone}
                                    </Typography>
                                    <Divider sx={{my: 1}}/>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        <strong>Yetkiler:</strong>
                                    </Typography>
                                    <List dense>
                                        {getPermissionsDescriptions(user.permissions, isAdmin).map((desc, index) => (
                                            <ListItem key={index} disableGutters>
                                                <ListItemIcon>
                                                    <InfoIcon fontSize="small" color="primary"/>
                                                </ListItemIcon>
                                                <ListItemText primary={desc}/>
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{my: 1}}/>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Oluşturulma Tarihi:</strong> {formatDate(user.createdDate)}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Menu
                                id={id}
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: {
                                        boxShadow: 3, // Hafif gölge
                                        borderRadius: 1,
                                        minWidth: 150,
                                        mt: 1,
                                        backgroundColor: theme.palette.background.paper
                                    }
                                }}
                                BackdropProps={{
                                    sx: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)' // Hafif karartma
                                    }
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
                                <MenuItem onClick={handleEditClick}>
                                    <EditIcon sx={{mr: 1}}/>
                                    Düzenle
                                </MenuItem>
                                <MenuItem onClick={handleDeleteClick}>
                                    <DeleteIcon sx={{mr: 1}}/>
                                    Sil
                                </MenuItem>
                            </Menu>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
