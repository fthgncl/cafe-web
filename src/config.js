export const cafeName = '1908';
export const apiSocketAddress = process.env.REACT_APP_API_SOCKET_ADDRESS;
export const localStorageAccountName = 'cafe1908-account';
export const systemPermissions = {
    sys_admin: {
        code: 'a',
        name: 'Sistem yöneticisi',
        description: 'Tüm sistem kaynaklarına tam erişim sağlar.'
    },
    admin: {
        code: 'b',
        name: 'Ürün yöneticisi',
        description: 'Ürün listesini düzenleyebilir.'
    },
    report_viewer: {
        code: 'c',
        name: 'Rapor Görüntüleyici',
        description: 'Raporları görüntüleyebilir.'
    },
    order_entry: {
        code: 'd',
        name: 'Sipariş Giriş Yetkisi',
        description: 'Sipariş girişi yapabilir.'
    },
    payment_processing: {
        code: 'e',
        name: 'Ödeme İşleme Yetkisi',
        description: 'Ödeme alabilir.'
    },
    discount_application: {
        code: 'f',
        name: 'İndirim Uygulama Yetkisi',
        description: 'Dilerse ödemeye indirim uygulayabilir.'
    },
    order_handling: {
        code: 'g',
        name: 'Mutfak Sipariş Yönetimi',
        description: 'Mutfakta siparişleri karşılayabilir ve tamamlandığında onaylayabilir.'
    }
};
