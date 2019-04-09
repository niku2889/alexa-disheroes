const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YinYanSchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('YinYan', YinYanSchema);