import User from '../models/user.js';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import  jwt  from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()


export const SignUp = async (req, res) => {
    try {
        const {firstName, lastName, email, password } = req.body;
       
        if(!firstName) {
            return res.status(400).json({success:false, message: "firstName is required"});
        }
        if(!lastName) {
            return res.status(400).json({success:false, message: "LastName is required"});
        }
        if(!email) {
            return res.status(400).json({success:false, message: "Email is required"});
        }
        if(!password) {
            return res.status(400).json({success:false, message: "Password is required"});
        }
   

        
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({success:false, message: "Email is taken"});
        }

        const hashed = await hashPassword(password);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashed,
            });
    
        await user.save();

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        return res.json({success: true, user, token});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err.message});
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        // Exclude password from the user object before sending the response
        const { password: userPassword, ...userWithoutPassword } = user._doc;

        return res.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
            token
        });
    } catch (err) {
        console.error("Error during login:", err.message);
        return res.status(500).json({ success: false, message: "Login failed", error: err.message });
    }
};