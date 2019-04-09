const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VrmRegSchema = new Schema({
    regno: Schema.Types.String,
    ktype: Schema.Types.String,
    make: Schema.Types.String,
    model: Schema.Types.String,
    engine: Schema.Types.String,
    year: Schema.Types.String
});

module.exports = mongoose.model('VrmReg', VrmRegSchema);