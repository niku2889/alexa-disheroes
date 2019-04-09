const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    name:Schema.Types.String,
    email: Schema.Types.String,
    password: Schema.Types.String,
});

module.exports = mongoose.model('User', UsersSchema);