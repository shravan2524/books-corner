const mongoose = require('mongoose');
const { Schema } = mongoose;


const like = new Schema({
    username: String,
    default : 0,
    _id : String,
})
const comment = new Schema({
    username: String,
    comment: String,
    default : 0,
    _id : String,
})

const postSchema = new Schema({
    username:String,
    description:String,
    image:String,
    title:String,
    date:String,
    comments: [comment],
    likes: [like],
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;