// ../helper/stringTurkish.js

const turkishToUpper = (str) => {
    const letters = { "i": "İ", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö", "ç": "Ç", "ı": "I" };
    return str.replace(/(([iışğüçö]))/g, (letter) => letters[letter]).toUpperCase();
};

const turkishToLower = (str) => {
    const letters = { "İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç" };
    return str.replace(/(([İIŞĞÜÇÖ]))/g, (letter) => letters[letter]).toLowerCase();
};

const toUpperOnlyFirstChar = (str) => {
    str = str.replaceAll(/\s+/g, ' ');
    let strings = str.split(" ");
    for (let i = 0; i < strings.length; i++) {
        strings[i] = strings[i][0].toUpperCase() + strings[i].substring(1).toLowerCase();
    }
    return strings.join(" ");
};

module.exports = {
    turkishToUpper,
    turkishToLower,
    toUpperOnlyFirstChar
};
