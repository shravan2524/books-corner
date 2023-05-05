const http = require('http');
const express = require('express')
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;
const User = require("./models/User");
const Books = require("./models/Books");
const Post = require("./models/Post");
const { query } = require('express');

// Connection URI
const url = "mongodb+srv://shravan:ravilata@cluster0.yyer7.mongodb.net/project1?retryWrites=true&w=majority";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database connected');
});

app.post("/signup", (req, res) => {
  console.log(req.body);
  let items = req.body.data;
  console.log(items, "af");
  const newUser = new User({
    name: items.name,
    username: items.username,
    password: items.password,
  });
  newUser.save()
    .then((newUser) => {
      console.log("Record inserted");
      res.send("Success");
    })
    .catch((err) => console.log(err));
})

app.post("/login", (req, res) => {
  let { items } = req.body.data;
  console.log(req.body, items);
  let query = { username: req.body.data.username, password: req.body.data.password };
  console.log(query);
  User.find(query)
    .then((users) => {
      console.log(users, "shravan");
      if (users) {
        console.log("rignt matched");
        res.send(users);
      }
      else {
        let mes = "username / password is wrong";
        console.log("abc", users.length);
        res.send({ mes: mes });
      }
    })
    .catch(err => console.log(err));
})

app.get("/books", (req, res) => {
  Books.find()
    .then((data) => {
      // console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err))
})

app.post("/bookid", (req, res) => {
  let items = req.body;
  console.log(items, "sgsg");
  Books.findById(items.data)
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err))
})

app.post("/post", (req, res) => {
  const { formData, imagePreSignedUrl, username } = req.body
  // console.log(formData, imagePreSignedUrl, "afa");
  var dateTime = require('node-datetime');
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  const newPost = new Post({
    username: username,
    image: imagePreSignedUrl,
    title: formData.title,
    description: formData.description,
    date: formatted,
    comments: [],
    likes: [],
  });
  newPost.save()
    .then((newPost) => {
      console.log("Record inserted", newPost);
      const query = { username: username }
      User.findOne(query)
        .then((data) => {
          tempPosts = data.posts;
          tempPosts.push(newPost._id);
          User.updateOne(query, { posts: tempPosts })
            .then((e) => {
              res.send(tempPosts);
            })
            .catch((err) => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch((err) => console.log(err));
})

app.get("/getallpost", (req, res) => {
  console.log("hi");
  Post.find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => console.log(err));
})

app.post("/postcomment", (req, res) => {
  const { formData, id, username } = req.body;
  console.log(formData, id, username);
  const postcomment = {
    username: username,
    comment: formData.comment,
    _id: id,
  }
  Post.findById(id)
    .then((data) => {
      console.log(data, "afaf");
      const tempcomments = data.comments;
      tempcomments.push(postcomment);
      Post.updateOne({ _id: id }, { comments: tempcomments })
        .then((e) => {
          res.send(e);
        })
        .catch((err) => console.log(err));
    })
})

app.post("/getcomments", (req, res) => {
  const id = req.body.id;
  console.log(id, req.body);
  Post.findById(id)
    .then((data) => {
      console.log(data, "hrllo");
      res.send(data.comments);
    })
    .catch((err) => console.log(err));
})

app.post("/profile", (req, res) => {
  let items = req.body.data;
  User.findOne({ username: items })
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err))
})

app.post("/addliketopost", (req, res) => {
  const { _id, username } = req.body;
  console.log(_id, username);
  const taddliketopost = {
    username: username,
    _id: _id,
  }
  Post.findById(_id)
    .then((data) => {
      const tempData = data.likes;
      tempData.push(taddliketopost);
      Post.findByIdAndUpdate(_id, { likes: tempData })
        .then((data) => {
          res.send(data);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
})

app.post("/removeliketopost", (req, res) => {
  const { _id, username } = req.body;
  console.log(_id, username);
  const taddliketopost = {
    username: username,
    _id: _id,
  }
  Post.findById(_id)
    .then((data) => {
      const tempData = data.likes;
      function arrayRemove(arr) {
        return arr.filter(function (geeks) {
          return geeks.username != username;
        });

      }
      const result = arrayRemove(tempData);

      Post.findByIdAndUpdate(_id, { likes: result })
        .then((data) => {
          res.send(data);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
})

app.post("/follow", (req, res) => {
  const { username, currentUserName } = req.body;
  const query = { username: username };
  User.findOne(query).
    then((data) => {
      const tempfollow = data.followers;
      tempfollow.push(currentUserName);
      User.findOneAndUpdate(query, { followers: tempfollow })
        .then((data1) => {
          console.log(data1);
        })
        .catch((err) => console.log(err))
    })

  query = { username: currentUserName };
  User.findOne(query).
    then((data) => {
      const tempfollow = data.followings;
      tempfollow.push(username);
      User.findOneAndUpdate(query, { followings: tempfollow })
        .then((data1) => {
          console.log(data1);
        })
        .catch((err) => console.log(err))
    })
})

app.post("/liketobook", (req, res) => {
  const { _id, likes } = req.body;
  console.log(_id, likes, req.body);
  Books.findByIdAndUpdate(_id, { likes: likes })
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err));
})

app.post("/postcommenttobook", (req, res) => {
  const { formData, id, username } = req.body;
  console.log(formData, id, username);
  const postcomment = {
    username: username,
    comment: formData.comment,
    _id: id,
  }
  Books.findById(id)
    .then((data) => {
      console.log(data, "afaf");
      const tempcomments = data.comments;
      tempcomments.push(postcomment);
      Books.updateOne({ _id: id }, { comments: tempcomments })
        .then((e) => {
          res.send(e);
        })
        .catch((err) => console.log(err));
    })
})

app.post("/getcommentsofbook", (req, res) => {
  const id = req.body.id;
  console.log(id, req.body);
  Books.findById(id)
    .then((data) => {
      console.log(data, "hrllo");
      res.send(data.comments);
    })
    .catch((err) => console.log(err));
})

app.post("/addtocollection", (req, res) => {
  const { id, username } = req.body;
  const query = { username: username };
  User.findOne(query)
    .then((data) => {
      const tempcollections = data.collections;
      tempcollections.push(id);
      console.log(tempcollections);
      User.updateOne(query, { collections: tempcollections })
        .then((e) => {
          res.send(tempcollections);
        })
        .catch((err) => console.log(err));
    })
    .catch(err => console.log(err));
})

app.post("/getcollections", (req, res) => {
  const username = req.body.username;
  User.findOne({username:username})
    .then((data) => {
      res.send(data.intrested);
    })
    .catch(err => console.log(err));
})

app.post("/getuserpost", (req, res) => {
  const username = req.body.username;
  User.findOne({username:username})
    .then((data) => {
      res.send(data.posts);
    })
    .catch(err => console.log(err));
})

app.post("/removepost", (req, res) => {
  const {username, id} = req.body;
  console.log(username, id);
  const query = {username : username};
  User.findOne(query)
  .then((data) => {
    const tempPosts = data.posts;
    const result = tempPosts.filter((post) => post.toString() !== id);
    console.log(result, tempPosts, id);
    User.findOneAndUpdate(query, {posts:result})
    .then((data) => {
      res.send(data)
  })
    .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
})

app.post("/removefromcollections", (req, res) => {
  const {username, id} = req.body;
  const query = {username : username};
  User.findOne(query)
  .then((data) => {
    const tempcollections = data.collections;
    const result = tempcollections.filter((collection) => collection !== id);
    console.log(result, tempcollections, id);
    User.findOneAndUpdate(query, {collections:result})
    .then((data) => {
      res.send(data)
  })
    .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
})

app.listen(PORT, () => {
  console.log(`running at ${PORT}`);
})