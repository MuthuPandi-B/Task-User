import User from "../Models/user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Register a new user || signup

export const registerUser = async (req, res) => {
  try {
    const {name, username, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    //console.log(hashPassword);
    const newUser = new User({name, username, email, password: hashPassword,  });
    await newUser.save();
    res
      .status(200)
      .json({ message: "User Registered Successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//login user || signin
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();
    res
      .status(200)
      .json({ message: "User Logged In Successfully", token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get user

export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("username email name");
    res
      .status(200)
      .json({
        message: "Authorized User",
        Name: user.name,
        UserId: req.user._id,
        UserName: user.username,
        Email: user.email,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};