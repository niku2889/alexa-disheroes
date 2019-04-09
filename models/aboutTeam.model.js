const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AboutTeamSchema = new Schema({
    name: Schema.Types.String,
    position: Schema.Types.String,
    photo: Schema.Types.String,
    description: Schema.Types.String,
});

module.exports = mongoose.model('AboutTeam', AboutTeamSchema);