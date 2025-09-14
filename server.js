if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dish = require("./express-backend/models/dish");
const User = require("./express-backend/models/user");
const ingredient = require("./express-backend/models/ingredients");
const utility = require("./express-backend/helper/utilities");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuthToken = require("./express-backend/middlewares/check-token");
const multer = require("multer");
const path = require("path");


// CONNECTING TO DATABASE
const dbUrl = "mongodb://localhost:27017/recipeBook";
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : "));
db.once("open", function () {
  console.log("Database connected");
});


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/images", express.static(path.join("express-backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "express-backend/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = utility.mimeTypeMap[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
})

app.get("/allDishes/:index/:size", async function(req, res) {
  const { index, size } = req.params;
  let pageIndexNum = +index;
  const recordsCount = await dish.countDocuments();
  let dishes = [];
  if(recordsCount > 0) {
    const numberOfPages = utility.getNumberOfPages(recordsCount, size);
    if(index === '1') {
      dishes = await dish.find({}).populate("ingredients").sort({ _id: -1 }).limit(size);
    } else {
       let startIndex = (pageIndexNum - 1) * size;
       dishes = await dish.find({}).populate("ingredients").skip(startIndex).sort({ _id: -1 }).limit(size);
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "data fetched successfully",
      numberOfPages: numberOfPages,
      totalRecords: recordsCount,
      nextIndex: pageIndexNum + 1,
      previousIndex: pageIndexNum - 1,
      data: dishes
    });
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: "No data is available"
    });
  }
})

app.get("/dishes/:id", async function(req, res) {
  const { id } = req.params;
  const foundDish = await dish.findById(id).populate("ingredients");
  if(foundDish != null) {
    res.status(200).json({
      status: "SUCCESS",
      data: foundDish
    });
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: `dish not found for the id ${id}`
    });
  }
});

app.get("/dishSearch/:dishName/:index/:size", async function(req, res) {
  const { dishName, index, size } = req.params;
  const pageIndexNum = +index;
  const recordsCount = await  dish.find({ $or: [{ name: new RegExp(dishName, "i") }] }).countDocuments();
  if(recordsCount > 0) {
    const numberOfPages = utility.getNumberOfPages(recordsCount, size);
    let dishes = [];
    if(index === '1') {
      dishes = await dish.find({ $or: [{ name: new RegExp(dishName, "i") }] }).populate("ingredients").sort({ _id: -1 }).limit(size);
    } else {
       let startIndex = (pageIndexNum - 1) * size;
       dishes = await dish.find({ $or: [{ name: new RegExp(dishName, "i") }] }).populate("ingredients").skip(startIndex).sort({ _id: -1 }).limit(size);
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "data fetched successfully",
      numberOfPages: numberOfPages,
      totalRecords: recordsCount,
      nextIndex: pageIndexNum + 1,
      previousIndex: pageIndexNum - 1,
      data: dishes
    });
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: "No data is available"
    });
  }
})

app.post("/dishes", checkAuthToken, multer({storage: storage}).single("imagePath"), async function(req, res) {
  try {
    const url = req.protocol + "://" + req.get("host");
    const { name, description, ing, creatorId, type } = req.body;
    const ingArray = JSON.parse(ing);
    const newDish = new dish({
      name: name.trim(),
      description: description.trim(),
      imagePath: url + "/images/" + req.file.filename,
      type: type,
      userId: creatorId
    });
    for(let item of ingArray) {
      const newIngredients = new ingredient({ name: item.ingName, quantity: item.amount.toString() });
      await newIngredients.save();
      newDish.ingredients.push(newIngredients);
    }
    await newDish.save();
    res.status(200).json({
      status: "SUCCESS",
      message: "Data saved successfully",
      data: newDish
    });
  } catch(error) {
    console.log(error);
    res.status(200).json({
      status: "FAILURE",
      message: "Unable to save data"
    });
  }
});

app.post("/dishes/edit", checkAuthToken, multer({storage: storage}).single("imagePath"), async function(req, res) {
  try {
    const url = req.protocol + "://" + req.get("host");
    const { name, description, ing, id } = req.body;
    const ingArray = JSON.parse(ing);
    const dishFound = await dish.findById(id);
    if(dishFound) {
      for(let item of dishFound.ingredients) {
        await dish.updateOne({ _id: id }, { $pull: {"ingredients": { _id: item._id }}});
      }
      for(let item of dishFound.ingredients) {
        await ingredient.findByIdAndDelete(item._id);
      }

      // creating new ingredients
      let updatedIngredients = [];
      if(ingArray.length > 0) {
        for(let item of ingArray) {
          const newIngredients = new ingredient({ name: item.ingName, quantity: item.amount.toString() });
          await newIngredients.save();
          updatedIngredients.push(newIngredients);
        }
      }
      const updatedDish = await dish.findByIdAndUpdate(id, {
        name: name.trim(),
        description: description.trim(),
        imagePath: url + "/images/" + req.file.filename,
        ingredients: updatedIngredients
      }, { new: true });
      res.status(200).json({
        status: "SUCCESS",
        message: "Data updated successfully",
        data: updatedDish
      });
    } else {
      res.status(200).json({
        status: "FAILURE",
        message: "Invalid ID passed for updation"
      });
    }
  } catch(error) {
    res.status(200).json({
      status: "FAILURE",
      message: "Error occured while updating dish"
    });
  }
})

app.get("/deleteDish/:id", checkAuthToken, async function(req, res) {
  try {
    const { id } = req.params;
    const deletedDish = await dish.findByIdAndDelete(id);
    if(deletedDish == null) {
      res.status(200).json({
        status: "FAILURE",
        message: "Data not found"
      });
    } else {
      res.status(200).json({
        status: "SUCCESS",
        message: "Data deleted successfully."
      });
    }
  } catch(error) {
    res.status(200).json({
      status: "FAILURE",
      message: "Error occured while deleting data"
    });
  }
});

app.post("/userRegistration", multer({storage: storage}).single("imagePath"), async function(req, res) {
  const url = req.protocol + "://" + req.get("host");
  const { name, username, password, emailId } = req.body;
  const usernameCheck = await User.findOne({ username: username.trim() });
  if(usernameCheck == null) {
     const emailCheck = await User.findOne({ emailId: emailId.trim() });
     if(emailCheck == null) {
      let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
      });
      let mailOptions = {
          from: process.env.MAIL_ID,
          to: `${emailId}`,
          subject: `Welcome ${name} ✔`,
          text: "Greetings from Food Mania! Here you can add your own exclusive dishes and their recipes and view what other users on the site have shared.",
        };
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            res.status(200).json({
              status: "FAILURE",
              message: `Unable to send confirmation mail to ${emailId}`
            });
          } else {
            const hashedPassword = await bcrypt.hash(password, 12);
            let userObject = new User({
              fullName: name.trim(),
              username: username.trim(),
              password: hashedPassword,
              emailId: emailId,
              imagePath: url + "/images/" + req.file.filename
            });
            const newUser = new User(userObject);
            await newUser.save();
            res.status(200).json({
              status: "SUCCESS",
              message: `Account created successfully, you can login with your credentials now`,
              data: newUser
            });
          }
        });
     } else {
      res.status(200).json({
        status: "FAILURE",
        message: "Entered emailID is already in use by some other user, try a different one."
      });
     }
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: "Username already exists please try a different one."
    });
  }
})

app.post("/login", async function(req, res) {
  const { username, password } = req.body;
  const usernameCheck = await User.findOne({ username: username.trim() });
  if(usernameCheck == null) {
    res.status(200).json({
      status: "FAILURE",
      message: utility.InvalidLogin
    });
  } else {
    const validpw = await bcrypt.compare(password, usernameCheck.password);
    if(validpw) {
      const token = jwt.sign(
        { username: usernameCheck.username,
          emailId: usernameCheck.emailId,
          userId: usernameCheck._id
        },
        "test_secret_token",
        { expiresIn: "1h" }
      );
       res.status(200).json({
        status: "SUCCESS",
        message: `Logged in as ${usernameCheck.fullName}`,
        expiresIn: 3600,
        token: token,
        userId: usernameCheck._id
      });
    } else {
      res.status(200).json({
        status: "FAILURE",
        message: utility.InvalidLogin
      });
    }
  }
})

app.post("/postLiked", checkAuthToken, async function(req, res) {
  const { dishId, userId } = req.body;
  const dishFound = await dish.findById(dishId);
  if(dishFound) {
    let likesList = dishFound.likes;
    if(likesList) {
      let message = "";
      if(likesList.includes(userId.toString())) {
        const updatedList = likesList.filter(id => id !== userId.toString() );
        await dish.findByIdAndUpdate(dishId, { likes: updatedList });
        message = "You unliked this post";
      } else {
        likesList.push(userId.toString());
        await dish.findByIdAndUpdate(dishId, { likes: likesList });
        message = "You liked this post";
      }
      res.status(200).json({
        status: "SUCCESS",
        message: message
      });
    }
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: "Dish data not found"
    });
  }
})

app.get("/userProfileData/:id", checkAuthToken, async function(req, res){
  const { id } = req.params;
  const userData = await User.findById(id);
  if(userData) {
    let likedDishes = [];
    const addedDishes = await dish.find({ userId: id });
    const allDishes = await dish.find();
    for(let dish of allDishes) {
      if(dish.likes && dish.likes.length > 0 && dish.likes.includes(id)) {
        likedDishes.push(dish);
      }
    }
    res.status(200).json({
      status: "SUCCESS",
      userData: userData,
      addedDishes: addedDishes,
      likedDishes: likedDishes
    });
  } else {
    res.status(200).json({
      status: "FAILURE",
      message: "user not found"
    });
  }
})

const port = 8000;
app.listen(port, function (req, res) {
  console.log(`Server established on port ${port}`);
});
