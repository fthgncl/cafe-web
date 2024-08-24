import * as yup from 'yup'

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
const phoneRules = /^[0-9]{10}$/;

export const userSchema = (isEditMode) => yup.object().shape({

    firstname: yup
        .string()
        .min(3, 'İsminiz en az 3 karakter içermelidir.')
        .max(20, 'İsminiz 20 karakterden daha fazla olamaz.')
        .required('İsim boş bırakılamaz.'),

    lastname: yup
        .string()
        .min(3, 'Soyisminiz en az 3 karakter içermelidir.')
        .max(20, 'Soyisminiz 20 karakterden daha fazla olamaz.')
        .required('Soyisim boş bırakılamaz.'),

    username: yup
        .string()
        .min(3, 'Kullanıcı adınız en az 3 karakter içermelidir.')
        .max(20, 'Kullanıcı adınız 20 karakterden daha fazla olamaz.')
        .required('Kullanıcı adı bırakılamaz.'),

    phone: yup
        .string()
        .matches(phoneRules, {
            message: 'Geçerli bir telefon numarası giriniz.',
        }),

    // Şifre alanlarını sadece yeni kullanıcı oluşturma işlemi için zorunlu yapıyoruz
    ...(isEditMode ? {} : {
        password: yup
            .string()
            .required('Lütfen bir şifre belirleyiniz.')
            .min(6, 'Şifre en az 6 haneli olmalıdır.')
            .matches(passwordRules, {
                message: 'Şifre en az bir büyük, bir küçük harf ve bir sayı içermelidir.',
            }),

        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
            .required('Tekrar şifre girmek zorunludur'),
    }),

    permissions: yup
        .string()
        .required('Lütfen en az bir yetki seçiniz')

});