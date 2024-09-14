import { DateRangePicker, defaultInputRanges, defaultStaticRanges } from 'react-date-range';
import { tr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useMediaQuery, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function DatePickerComponent({changeDataRange}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 2); // Bugünden iki gün önce

        return {
            startDate: yesterday,
            endDate: today,
            key: 'selection'
        };
    });

    useEffect(() => {
        changeDataRange(dateRange)
    }, [dateRange]);

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSelect = (ranges) => {
        setDateRange(ranges.selection);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const inputRange = [
        {
            ...defaultInputRanges[0],
            label: "günden bu yana",
        }
    ];

    defaultStaticRanges[0].label = "Bu Gün";
    defaultStaticRanges[1].label = "Dün";
    defaultStaticRanges[2].label = "Bu Hafta";
    defaultStaticRanges[3].label = "Geçen Hafta";
    defaultStaticRanges[4].label = "Bu Ay";
    defaultStaticRanges[5].label = "Geçen Ay";

    // Seçenek tıklandığında tarih aralığını güncelle
    const handlePredefinedRange = (range) => {
        const selectedRange = range();
        setDateRange({
            startDate: selectedRange.startDate,
            endDate: selectedRange.endDate,
            key: 'selection'
        });
        setDialogOpen(false);  // Seçimden sonra dialogu kapat
    };

    useEffect(() => {
        // Ekran boyutuna göre hazır tarih seçeneklerini gizle veya göster
        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        if (isMobile) {
            styleTag.innerHTML = `
                .rdrDefinedRangesWrapper {
                    display: none;
                }
            `;
        } else {
            styleTag.innerHTML = `
                .rdrDefinedRangesWrapper {
                    display: flex;
                    border-radius: 15px 15px 0 15px;
                    flex-direction: column;
                    justify-content: center;
                    width: 175px;
                }
            `;
        }
        document.head.appendChild(styleTag);

        return () => {
            document.head.removeChild(styleTag); // Component unmount olursa temizle
        };
    }, [isMobile]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                margin: '0 auto',
                padding: isMobile ? 2 : 0,
            }}
        >
            {/* Yalnızca mobil görünümde buton göster */}
            {isMobile && (
                <Button variant="contained" color="primary" size="small" onClick={handleDialogOpen}>
                    Tarih Seçenekleri
                </Button>
            )}

            {/* Dialog bileşeni */}
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth={true} maxWidth="sm">
                <DialogTitle>Tarih Aralığı Seç</DialogTitle>
                <DialogContent dividers>
                    <List>
                        {defaultStaticRanges.map((rangeOption, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onClick={() => handlePredefinedRange(rangeOption.range)}>
                                    {rangeOption.label}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ width: '100%',display:'flex', justifyContent:'center', maxWidth: '900px', mt: 2 }}>
                {/* Normal tarih aralığı seçimi */}
                <DateRangePicker
                    dateDisplayFormat={"d MMMM yyyy"}
                    ranges={[dateRange]}
                    onChange={handleSelect}
                    locale={tr}
                    showSelectionPreview={true}
                    rangeColors={['#3d91ff']}
                    direction={isMobile ? "vertical" : "horizontal"}
                    months={isMobile ? 1 : 2}
                    staticRanges={!isMobile?defaultStaticRanges:[]}
                    inputRanges={!isMobile?inputRange:[]}
                />
            </Box>
        </Box>
    );
}

export default DatePickerComponent;
