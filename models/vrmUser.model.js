const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VrmUserSchema = new Schema({
    ip: Schema.Types.String,
    date: Schema.Types.String,
});

module.exports = mongoose.model('VrmUser', VrmUserSchema);