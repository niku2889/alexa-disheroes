const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CookeySchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('Cookey', CookeySchema);