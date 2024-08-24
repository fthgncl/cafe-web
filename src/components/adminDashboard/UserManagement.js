import React, {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../context/SocketContext";
import CreateUser from "./CreateUser";
import {systemPermissions} from '../../config';
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
    Menu,
    Button
} from '@mui/material';
import {deepPurple} from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Masonry from "@mui/lab/Masonry";
import {useSnackbar} from "notistack";
import {AccountContext} from "../../context/AccountContext";

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
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    return new Date(dateString).toLocaleDateString('tr-TR', options);
};

export default function UserManagement() {
    const {enqueueSnackbar} = useSnackbar();
    const {sendSocketMessage, socketData} = useContext(SocketContext);
    const {accountProps} = useContext(AccountContext);
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
    const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const getUsersMessageType = 'getUsers';
    const deleteUserMessageType = 'deleteUser';
    const createUserMessageType = 'createUser';

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        sendSocketMessage({}, getUsersMessageType);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!socketData || !socketData.message)
            return;

        if (socketData.type === 'updateUser') {
            if (socketData.message.status === "success" && socketData.message.updatedUser) {

                setUsers(prevState => prevState.map(user => {

                    if (user._id === socketData.message.updatedUser._id)
                        return socketData.message.updatedUser;

                    return user;
                }));
                setOpenEditUserDialog(false);
            }
            return
        }

        if (socketData.type === createUserMessageType) {
            if (socketData.message.status === "success" && socketData.message.data) {
                setUsers(prevState => [...prevState, socketData.message.data]);
            }
            return;
        }

        if (socketData.type === getUsersMessageType) {
            if (socketData.message.status === "success") {
                setUsers(socketData.message.users);
            }
            return;
        }

        if (socketData.type === deleteUserMessageType) {
            enqueueSnackbar(socketData.message.message, {variant: socketData.message.status});

            if (socketData.message.status === "success")
                setUsers(prevState => prevState.filter(user => user._id !== socketData.message.deletedUserId));
        }
        // eslint-disable-next-line
    }, [socketData]);

    const handleClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setCurrentUser({
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname
        });
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setOpenEditUserDialog(true);
        handleClose();
    };

    const handleDeleteClick = () => {
        setOpenDeleteConfirmDialog(true);
        handleClose();
    };

    const handleConfirmDelete = () => {
        sendSocketMessage({userId: currentUser.id}, deleteUserMessageType)
        setOpenDeleteConfirmDialog(false);
        setCurrentUser(null);
    };

    const handleCancelDelete = () => {
        setOpenDeleteConfirmDialog(false);
    };

    const handleAddUserClick = () => {
        setOpenCreateUserDialog(true);
    };

    const handleCloseCreateUserDialog = () => {
        setOpenCreateUserDialog(false);
    };

    const handleCloseEditUserDialog = () => {
        setOpenEditUserDialog(false);
    };

    return (
        <Box sx={{
            width: '100%',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',  // Flexbox düzeni için
            justifyContent: 'center',  // Yatayda ortalama
            minHeight: '100vh',  // Yüksekliği ekranın tamamı yapar
        }}>
            <Masonry columns={{xs: 1, sm: 2, md: 3}} spacing={isMobile ? 2 : 3}>
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
                        <CardContent sx={{textAlign: 'center'}}>
                            <PersonAddIcon sx={{fontSize: 60, color: theme.palette.primary.main}}/>
                            <Typography variant="h6" sx={{mt: 2}}>
                                Yeni Kullanıcı Ekle
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                {users.map((user) => {
                    const isAdmin = user.permissions.includes('a');

                    return (
                        <div key={user._id}>
                            <Card variant="outlined" sx={{borderRadius: 2, boxShadow: 2, height: '100%'}}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{bgcolor: deepPurple[500], width: 40, height: 40}}>
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
                                        <>
                                            {accountProps && accountProps.username !== user.username && (
                                                <IconButton
                                                    aria-label="daha fazla seçenek"
                                                    onClick={(event) => handleClick(event, user)}
                                                    sx={{padding: '10px'}}
                                                >
                                                    <MoreVertIcon/>
                                                </IconButton>
                                            )}
                                        </>
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
                                        <strong>Kayıt Tarihi:</strong> {formatDate(user.createdDate)}
                                    </Typography>
                                </CardContent>

                                {/* Üç noktalı menü */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && currentUser.id === user._id}
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
                                        <EditIcon sx={{mr: 1}}/>
                                        Düzenle
                                    </MenuItem>
                                    <MenuItem onClick={handleDeleteClick}>
                                        <DeleteIcon sx={{mr: 1}}/>
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
                    sx={{height: '50px', bgcolor: 'primary.main'}}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <PersonAddIcon sx={{color: 'white', mr: 1}}/>
                        <Typography variant="h6" sx={{color: 'white'}}>
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
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="custom-scrollbar" sx={{overflowY: 'auto'}}>
                    <CreateUser onClose={handleCloseCreateUserDialog}/>
                </DialogContent>
            </Dialog>

            {/* Kullanıcı Düzenleme Dialogu */}
            <Dialog
                open={openEditUserDialog}
                onClose={handleCloseEditUserDialog}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle
                    sx={{height: '50px', bgcolor: 'primary.main'}}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <EditIcon sx={{color: 'white', mr: 1}}/>
                        <Typography variant="h6" sx={{color: 'white'}}>
                            Kullanıcıyı Düzenle
                        </Typography>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseEditUserDialog}
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
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="custom-scrollbar" sx={{overflowY: 'auto'}}>
                    {currentUser && <CreateUser userId={currentUser.id} onClose={handleCloseEditUserDialog}/>}
                </DialogContent>
            </Dialog>

            {/* Silme Onay Diyaloğu */}
            <Dialog
                open={openDeleteConfirmDialog}
                onClose={handleCancelDelete}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {!!currentUser && `${currentUser.firstname} ${currentUser.lastname} Kullanıcısını Sil`}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Bu kullanıcıyı silmek istediğinizden emin misiniz?
                    </Typography>
                </DialogContent>
                <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 2}}>
                    <Button
                        onClick={handleCancelDelete}
                        color="primary"
                        variant="outlined"
                        sx={{mr: 1}}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                    >
                        Sil
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}
