const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('Brand', BrandSchema);