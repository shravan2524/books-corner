const mongoose = require('mongoose');
const { Schema } = mongoose;


const bookSchema = new Schema({
    name:String,
    description:String,
    image:String,
    link:String,
    comments: Array,
    likes: Number,
});

const Books = mongoose.model('books', bookSchema);

module.exports = Books;