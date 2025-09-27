import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if(!fullName || !email || !password) {
        return res.status(400).json({ message: "All field are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 character" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        fullName,
        email,
        password: hashPassword
    })

    if(newUser){
        //generate jwt token here
        generateToken(newUser._id, res)
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        })

    }
    else{
        res.status(400).json({message: "Invalid User data"});
    }
  } catch (error) {
    console.log("Error is signup controller", error.message)
    res.status(500).json({message: "Invalid Server Error"});
  }
};
// export const login = async (req, res) => {
//     const {email, password} = req.body
//     try{
//         const user = await User.findOne({email})

//         if(!user) {
//             return res.status(400).json({message: "Invalid Credentials"})
//         }

//         const isPasswordCorrected = await bcrypt.compare(password, user.password)

//         if(!isPasswordCorrected) {
//             return res.status(400).json({message: "Invalid Credentials"});
//         }
        
//         generateToken(user._id,res)

//         res.status(200).json({
//             _id: user._id,
//             fullName: user.fullName,
//             email: user.email,
//             profilePic: user.profilePic,
//         })

//     }
//     catch(error) {
//         console.log("Error in login controller", error.message);
//         res.status(500).json({message: "Internal Server Error"})
        
//     }
//   res.send("login route");
// };

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrected = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrected) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message: "logged out successfully"})
    }
catch(error) {
    console.log("error in logout controller", error.message)
    res.status(500).json({message: "Internal Server Error"})
}
};

export const updateprofile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile is Required"})
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updateUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json(updateUser)

    } catch (error) {
        console.log("error in update profile",error)
        res.status(500).json({message:"Internal Server Error"})
        
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}