import User from "../models/user.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
dotenv.config();

export const SignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
      return res
        .status(400)
        .json({ success: false, message: "firstName is required" });
    }
    if (!lastName) {
      return res
        .status(400)
        .json({ success: false, message: "LastName is required" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is taken" });
    }

    const hashed = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashed,
    });

    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({ success: true, user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Exclude password from the user object before sending the response
    const { password: userPassword, ...userWithoutPassword } = user._doc;

    return res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Login failed", error: err.message });
  }
};

export const forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (user) {
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        const resetPasswordExpire = Date.now() + 3600000; // 1 hour from now
  
        // Update user with reset token and expiration
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();
  
        // Create the reset URL
        const resetUrl = `http://localhost:5174/reset-password/${resetToken}`;
  
        // Configure the email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password
          },
        });
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Password Reset Request",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="padding: 5px 7px; background: #4BA586; color: white; border-radius: 50%; font-size: 22px; font-family: 'Poppins', sans-serif; font-weight: 700; display: flex; justify-content: center; align-items: center;">
                  BH
                </div>
                <div style="font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 28px; margin-left: 10px;">
                  BetaHouse
                </div>
              </div>
              <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Reset Your Password</h2>
              <p>Hi ${user.firstName} ${user.lastName},</p>
              <p>You recently requested to reset your password. If you did not make this request, you can ignore this email.</p>
              <p>To reset your password, please click the button below.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a 
                  href="${resetUrl}" 
                  style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4BA586; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
              </div>
              <p>Regards,</p>
              <p>BetaHouse</p>
              <hr>
              <p style='text-align: center;'>Build by Matic🐒💖</p>
            </div>
          `,
        };
  
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res
              .status(500)
              .json({ success: false, message: "Failed to send email" });
          }
          res.json({ success: true, message: "Email sent" });
        });
      } else {
        res.json({
          success: true,
          message: "Email sent!",
        });
      }
    } catch (err) {
      console.error("Error during forgot password process:", err);
      res.status(500).json({
        success: false,
        message: "Failed to process forgot password request",
      });
    }
  };
  

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await hashPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password" });
  }
};
