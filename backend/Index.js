const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.json());
app.use(cors());

// Database Connection with Mongodb
mongoose.connect(
  "mongodb+srv://kumarsmbikash01:Ecommerce123@cluster0.3gbruyi.mongodb.net/e-commerce"
);

//API creation

app.get("/", (req, res) => {
  res.send("Express App is running");
});

// Image Storage

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

//creating upload end point
app.use("/images", express.static("upload/images"));
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for deleting products

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for getting all Products

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

//Shema Creating for user model

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  isAdmin: {
    type: Boolean,
    default: false, // Set default value to false
  },
  date: {
    type: Date,
    default: Date.now,
  },
});



app.post("/signup", async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email });

    if (check) {
      return res
        .status(400)
        .json({
          success: false,
          errors: "Existing User Found with the same email ID",
        });
    }

    // Hash the user's password before saving it to the database
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword, // Save the hashed password
      cartData: cart,
      isAdmin: req.body.isAdmin || false, // Set isAdmin based on request, default to false
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
  } catch (error) {
    // Handle any errors that occur during the signup process
    console.error("Signup Error:", error);
    return res
      .status(500)
      .json({ success: false, errors: "Internal Server Error" });
  }
});

//Creating endpoint for userlogin
app.post("/login", async (req, res) => {
    try {
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
          const data = {
            user: {
              id: user.id,
            },
          };
          const token = jwt.sign(data, "secret_ecom");
          res.json({ success: true, token });
        } else {
          res.status(401).json({ success: false, errors: "Wrong Password" });
        }
      } else {
        res.status(404).json({ success: false, errors: "Wrong Email ID" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
  });

// creating endpoint for newcollection data
app.get("/newcollection", async (req, res) => {
  let products = await Product.find({});

  let newcollection = products.slice(1).slice(-8);
  console.log("New Collection Fetched");
  res.send(newcollection);
});

//creating endpoint in populR IN WOMEN SECTION

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popularinwomen = products.slice(0, 4);
  console.log("Popular in Women fetched");
  res.send(popularinwomen);
});

//Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate uing valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res
        .status(401)
        .send({ errors: "please authenticate using a valid token" });
    }
  }
};

//Creating endpoint for adding products in cart

app.post("/addtocart", fetchUser, async (req, res) => {
  // console.log(req.body);
  console.log("added", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

//Creating endpoint to remove product from cartdata

app.post("/removefromcart", fetchUser, async (req, res) => {
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

// Creating endpoint for user profile
app.get("/user/profile", fetchUser, async (req, res) => {
  try {
    // req.user should contain the user information from the decoded token
    const userId = req.user.id;

    // Fetch the user from the database
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//Creating end point to get cartdata

app.post("/getcart", fetchUser, async (req, res) => {
  console.log("getCart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port" + port);
  } else {
    console.log("Error :" + error);
  }
});
