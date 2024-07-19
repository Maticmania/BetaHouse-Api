import User from '../models/user.js'
import { hashPassword } from '../helpers/auth.js';
import jwt from 'jsonwebtoken';
import { cloudinary } from '../configs/cloudinary.config.js';
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password")
        res.json({success: true, message: "Users fetched successfully", users})
    } catch (err) {
       res.status(500).json({success: false, message: err.message}) 
    }
}

export const getUserByID = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.json({success: true, message: "User retrieved successfully", user})
    } catch (err) {
        res.status(500).json({success: false, message: err.message}) 
    }
}

export const updateUser = async (req, res) => {
  try {
    const { _id } = req.user;
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const imageFile = req.file;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is taken" });
      }
      user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (imageFile) {
      if (user.image && user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }
      const imageResult = await cloudinary.uploader.upload(imageFile.path);
      user.image = imageResult.secure_url;
      user.imagePublicId = imageResult.public_id;
    }

    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const { password: _, ...userWithoutPassword } = user._doc;

    return res.json({
      success: true,
      message: "User profile updated successfully",
      user: userWithoutPassword,
      token
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ success: false, message: "Failed to update user profile", error: err });
  }
}

export const deleteUser = async (req, res) => {
    try {
      const { _id } = req.user; 
      const user = await User.findById(_id);
        if (!user) {
          return res.status(404).json({success: false, message: 'User not found' });
        }
        
        const deletedUser = await user.deleteOne();
        res.json({success: true, message: 'User deleted successfully', deletedUser });
      } catch (err) {
        res.status(500).json({success: false,  message: err.message });
      }
}