const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
    photo: Schema.Types.String
});

module.exports = mongoose.model('Category', CategorySchema);