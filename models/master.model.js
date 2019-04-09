const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MasterSchema = new Schema({
    kType: Schema.Types.Number,
    articleGroupId: Schema.Types.String,
    articleCountId: Schema.Types.Number,
    oePartNos: Schema.Types.String,
    crossRefAftermarket: Schema.Types.String,
    mainCategory: Schema.Types.String,
    category1: Schema.Types.String,
    category2: Schema.Types.String,
    location1: Schema.Types.String,
    location2: Schema.Types.String,
    location3: Schema.Types.String,
    masterNote1: Schema.Types.String,
    masterNote2: Schema.Types.String,
    searchText: Schema.Types.String,
    variantsCount: Schema.Types.String,
    yinYangQ1: Schema.Types.String,
    yinYangQ2: Schema.Types.String,
    yinYan: Schema.Types.String,
    lapArtId:Schema.Types.String,
    oeIds:Schema.Types.String,
});

module.exports = mongoose.model('Master', MasterSchema);