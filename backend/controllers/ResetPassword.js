const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset password token

exports.resetPasswordToken = async(req, res) => {
    try {
        //get email from req body
        const email = req.body.email;

        //check user for this email - email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
                success:false,
                message:'Your email is not registered with us'
            });
        }

        //generate token
        const token = crypto.randomBytes(20).toString("hex");
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate (
            {email:email},
            { 
                token:token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            {new:true}
        );
        console.log("DETAILS", updatedDetails);

        //create url
        const url = `http://localhost:3000/update-password/${token}`
        //send mail containing the url
        await mailSender(email, 
                    "Password Rest Link",
                    `Password Reset Link: ${url}`
        );

        //return response
        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change password',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}

//resetpassword

exports.resetPassword = async (req, res) => {
    try{
        //data fetch
        const {password, confirmPassword, token} = req.body;
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }

        //get userDetails from db using token
        const userDetails = await User.findOne({token: token});

        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        //token time check
        if(userDetails.resetPasswordExpires > Date.now()) {
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }

        //hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        //return response
        return res.status(200).json({
            success:true,
            message:'password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}