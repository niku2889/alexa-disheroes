const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SearchSchema = new Schema({
    url: Schema.Types.String,
    kType: Schema.Types.Number,
    oePartNos: Schema.Types.String,
    crossRefAftermarket: Schema.Types.String,
    oeIds:Schema.Types.String
});

module.exports = mongoose.model('Search', SearchSchema);