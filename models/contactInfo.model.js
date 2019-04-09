const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactInfoSchema = new Schema({
    name: Schema.Types.String,
    phone: Schema.Types.String,
    email: Schema.Types.String,
    website: Schema.Types.String,
    address: Schema.Types.String,

});

module.exports = mongoose.model('ContactInfo', ContactInfoSchema);