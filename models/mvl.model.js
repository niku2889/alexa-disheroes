const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MvlSchema = new Schema({
    kType: Schema.Types.Number,
    manufacturer: Schema.Types.String,
    model: Schema.Types.String,
    engine: Schema.Types.String,
    year: Schema.Types.String,

});

module.exports = mongoose.model('Mvl', MvlSchema);