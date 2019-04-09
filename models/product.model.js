const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    lapArtId: Schema.Types.Number,
    supBrand: Schema.Types.String,
    artArticleNr: Schema.Types.String,
    artEANNumber: Schema.Types.String,
    descriptions: Schema.Types.String,
    brandInfoText: Schema.Types.String,
    searchText: Schema.Types.String,
    articleMediaFiles: Schema.Types.String,
    image2: Schema.Types.String,
    image3: Schema.Types.String,
    image4: Schema.Types.String,
    image5: Schema.Types.String,
    image6: Schema.Types.String,
    image7: Schema.Types.String,
    category: Schema.Types.String,
    artInfo:Schema.Types.String,
    // Amazon UK
    price: Schema.Types.String,
    link: Schema.Types.String,
    amazonLink: Schema.Types.String,
    lastModified: Schema.Types.Date,

    //Ebay UK
    ebayPrice: Schema.Types.String,
    ebayLink: Schema.Types.String,
    lastModifiedEbay: Schema.Types.Date,
    //Amazon DE
    amazonDEPrice: Schema.Types.String,
    amazonDELink: Schema.Types.String,
    lastModifiedAmazonDEPrice: Schema.Types.String,
    //Ebay DE
    ebayDEPrice: Schema.Types.String,
    ebayDELink: Schema.Types.String,
    lastModifiedEbayDEPrice: Schema.Types.String,
    //Amazon US
    amazonUSPrice: Schema.Types.String,
    amazonUSLink: Schema.Types.String,
    lastModifiedAmazonUSPrice: Schema.Types.String,
    //Ebay US
    ebayUSPrice: Schema.Types.String,
    ebayUSLink: Schema.Types.String,
    lastModifiedEbayUSPrice: Schema.Types.String,
    //123spareparts UK
    sparepartsPrice: Schema.Types.String,//removed
    sparepartsLink: Schema.Types.String,
    sparepartsLastModified: Schema.Types.String,
    //123spareparts DE
    sparepartsDEPrice: Schema.Types.String,
    sparepartsDELink: Schema.Types.String,
    sparepartsDELastModified: Schema.Types.String,
    priceData: {
        autoDocFR: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        piecesAutoFR: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        piecesDiscountFR: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoonderdelenDirectNL: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoteileMeileAT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoteileMeileCH: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoersatzteileAT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        bildelarOnlineSE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        pecasAutoPT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        repuestoscochesES: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        recambiosExpresES: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoersatzteileDE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        autoteileMeileDE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
        sparepartsCoUK: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            qty: Schema.Types.Number,
            lastModified: Schema.Types.Date
        },
    },
    ebayData: {
        AT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        AU: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        BE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        CA: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        CH: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        DE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        ES: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        FR: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        IE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        IT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        NL: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        UK: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        US: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            deliveryPrice: Schema.Types.String,
            totalPrice: Schema.Types.String,
            currency: Schema.Types.String,
            lastModified: Schema.Types.Date
        }
    },
    amazonData: {
        UK: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        DE: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        US: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        CA: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        FR: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        SP: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        },
        IT: {
            link: Schema.Types.String,
            price: Schema.Types.String,
            availability: Schema.Types.String,
            isPrime: Schema.Types.String,
            lastModified: Schema.Types.Date
        }
    }

});

module.exports = mongoose.model('Product', ProductSchema);