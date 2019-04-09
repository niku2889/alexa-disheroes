const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AboutDesSchema = new Schema({
    title1: Schema.Types.String,
    para1: Schema.Types.String,
    title2: Schema.Types.String,
    para2: Schema.Types.String,
    title3: Schema.Types.String,
    para3: Schema.Types.String,
    title4: Schema.Types.String,
    para4: Schema.Types.String,

});

module.exports = mongoose.model('AboutDes', AboutDesSchema);