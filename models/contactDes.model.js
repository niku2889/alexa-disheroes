const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactDesSchema = new Schema({
    title: Schema.Types.String,
    paragraphOne: Schema.Types.String,
    paragraphTwo: Schema.Types.String,
    paragraphThree: Schema.Types.String,
    paragraphFour: Schema.Types.String,

});

module.exports = mongoose.model('ContactDes', ContactDesSchema);