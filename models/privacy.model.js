const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivacySchema = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('Privacy', PrivacySchema);