import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import CreateUser from "./CreateUser";
import { systemPermissions } from '../../config';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    MenuItem,
    Menu
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Masonry from "@mui/lab/Masonry";

// İzin kodlarını açıklamalara dönüştüren fonksiyon
const getPermissionsDescriptions = (permissions, isAdmin) => {
    if (isAdmin) {
        return Object.values(systemPermissions).map(perm => perm.description);
    }

    if (!permissions) return ["Yetki Yok"];

    return permissions.split('').map(code => {
        const permission = Object.values(systemPermissions).find(perm => perm.code === code);
        return permission ? permission.description : `Bilinmeyen Yetki Kodu: ${code}`;
    });
};

// Tarih formatını düzenleyen fonksiyon
const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
};

export default function UserManagement() {
    const { sendSocketMessage, socketData } = useContext(SocketContext);
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
    const getUsersMessageType = 'getUsers';

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
        // eslint-disable-next-line
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

    const handleAddUserClick = () => {
        setOpenCreateUserDialog(true);
    };

    const handleCloseCreateUserDialog = () => {
        setOpenCreateUserDialog(false);
    };

    return (
        <Box sx={{
            width: '100%',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',  // Flexbox düzeni için
            justifyContent: 'center',  // Yatayda ortalama
            alignItems: 'center',  // Dikeyde ortalama
            minHeight: '100vh',  // Yüksekliği ekranın tamamı yapar
        }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={isMobile ? 2 : 3}>
                <div>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px',
                            cursor: 'pointer',
                            backgroundColor: theme.palette.background.paper,
                            border: `2px dashed ${theme.palette.primary.main}`,
                        }}
                        onClick={handleAddUserClick}
                    >
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonAddIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Yeni Kullanıcı Ekle
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                {users.map((user) => {
                    const isAdmin = user.permissions.includes('a');

                    return (
                        <div key={user._id}>
                            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: deepPurple[500], width: 40, height: 40 }}>
                                            {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                        </Avatar>
                                    }
                                    title={
                                        <Typography variant="h6" noWrap>
                                            {`${user.firstname} ${user.lastname}`}
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography variant="body2" color="textSecondary">
                                            {`Kullanıcı Adı: ${user.username}`}
                                        </Typography>
                                    }
                                    action={
                                        <IconButton
                                            aria-label="daha fazla seçenek"
                                            onClick={(event) => handleClick(event, user._id)}
                                            sx={{ padding: '10px' }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        <strong>Telefon:</strong> {user.phone}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        <strong>Yetkiler:</strong>
                                    </Typography>
                                    <List dense>
                                        {getPermissionsDescriptions(user.permissions, isAdmin).map((desc, index) => (
                                            <ListItem key={index} disableGutters>
                                                <ListItemIcon>
                                                    <InfoIcon fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={desc} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Oluşturulma Tarihi:</strong> {formatDate(user.createdDate)}
                                    </Typography>
                                </CardContent>

                                {/* Üç noktalı menü */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && currentUserId === user._id}
                                    onClose={handleClose}
                                    PaperProps={{
                                        sx: {
                                            boxShadow: 3,
                                            borderRadius: 1,
                                            minWidth: 150,
                                            mt: 1,
                                            backgroundColor: theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.divider}`,
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
                                        <EditIcon sx={{ mr: 1 }} />
                                        Düzenle
                                    </MenuItem>
                                    <MenuItem onClick={handleDeleteClick}>
                                        <DeleteIcon sx={{ mr: 1 }} />
                                        Sil
                                    </MenuItem>
                                </Menu>
                            </Card>
                        </div>
                    );
                })}
            </Masonry>

            {/* Yeni Kullanıcı Ekleme Dialogu */}
            <Dialog
                open={openCreateUserDialog}
                onClose={handleCloseCreateUserDialog}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle
                    sx={{ height: '50px', bgcolor: 'primary.main' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <PersonAddIcon sx={{ color: 'white', mr: 1 }} />
                        <Typography variant="h6" sx={{ color: 'white' }}>
                            Yeni Kullanıcı Ekle
                        </Typography>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseCreateUserDialog}
                        aria-label="close"
                        sx={{
                            color: 'white',
                            width: 25,
                            height: 25,
                            borderRadius: '50%',
                            '&:hover': {
                                bgcolor: 'primary.dark', // Hover efekti için arka plan rengini ayarlayın
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="custom-scrollbar" sx={{ overflowY: 'auto' }}>
                    <CreateUser />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
