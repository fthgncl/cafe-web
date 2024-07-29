import * as yup from 'yup';

const contentSchema = yup.object().shape({
    name: yup.string().required('İçerik adı boş bırakılamaz.'),
    extraFee: yup.number().min(0, 'Ek ücret sıfır veya pozitif bir değer olmalıdır.').required('Ek ücret boş bırakılamaz.'),
});

export const productSchema = yup.object().shape({
    productname: yup
        .string()
        .required('Ürün adı boş bırakılamaz.'),

    productcategory: yup
        .string()
        .required('Kategori boş bırakılamaz.'),

    sizes: yup.array().of(
        yup.object().shape({
            size: yup.string().required('Boyut adı boş bırakılamaz.'),
            extraFee: yup.number().min(0, 'Ek ücret sıfır veya pozitif bir değer olmalıdır.')
        })
    ).required('En az bir boyut eklenmelidir.'),

    contents: yup.array().of(contentSchema).required('En az bir ürün içeriği eklenmelidir.'),
});
