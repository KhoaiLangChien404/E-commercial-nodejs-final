import validator from "validator"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js"

const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}
const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success:false, message: "User doesn't exists"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = createToken(user._id)
            res.json({success:true,token})
        }
        else {
            res.json({success:false, message: 'Invalid credentials'})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
const registerUser = async(req,res) => {
    try {
        const {name, email, password} = req.body
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({success:false, message: "User already exists"})
        }
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email"})
        }
        if (password.length < 8) {
            return res.json({success:false, message:"Please enter a strong password"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        })
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
const adminLogin = async(req,res) => {
    try {
        
        const {email, password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
        {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})
        }
        else
        {
            res.json({success:false, message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const editUserInfo = async(req,res) => {
    try {
        const { name, email } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required' });
        }

        const userId = req.user.id;

        // Cập nhật name và email
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true } // Trả về thông tin đã cập nhật
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Failed to update profile' });
        }

        res.status(200).json({
            success: true,
            profile: {
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const changeUserPassword = async(req,res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const userId = req.user.id;

        // Lấy thông tin user
        const user = await userModel.findById(userId);

        // So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới
        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export {loginUser, registerUser, adminLogin, editUserInfo, changeUserPassword}