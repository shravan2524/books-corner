const mongoose = require('mongoose');
const { Schema } = mongoose;

const follower = new Schema({
    username: String,
    default : 0,
})
const following = new Schema({
    username: String,
    default : 0,
})

const userSchema = new Schema({
    username: String,
    name: String,
    password: String,
    posts: Array,
    likes: Array,
    followers : Array,
    followings: Array,
    collections: Array,
});

const User = mongoose.model('user', userSchema);

module.exports = User;