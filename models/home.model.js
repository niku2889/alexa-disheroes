const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HomeSchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('Home', HomeSchema);