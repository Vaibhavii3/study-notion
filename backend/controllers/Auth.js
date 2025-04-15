const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//SEND OTP

exports.sendotp = async(req, res) => {
    try {

        //fetch email from request body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exist, then return a response
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        
        //check unique otp or not
        let result = await OTP.findOne({otp: otp});
        console.log("OTP generated: ", OTP );
        console.log("Result", result);
        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({ otp: otp});
        }

        const otpPayload = {email, otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//signUP

exports.signup = async (req, res) => {
    try {

        //data fetch from request body
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword, 
            accountType, 
            contactNumber, 
            otp } = req.body;

        //validation
        if(
            !firstName || 
            !lastName || 
            !email || 
            !password || 
            !confirmPassword || 
            !otp ) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

        //match passwords
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword Value does not match, please try again',
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        
        //validate OTP
        if(recentOtp.length == 0) {
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'The OTP is not valid',
            })
        } else if(otp !== recentOtp[0].otp) {
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        //entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType: accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }
}

//Login
exports.login = async (req, res) => {
    try {
        //get data from req body
        const {email, password} = req.body;

        //validation
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
        }

        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User is not registrered, please signup first',
            });
        }

        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Login Failure, Please try again',
        });
    }
};

exports.changePassword = async(req, res) => {
    try{
        //get uer data
        const userDetails = await User.findById(req.user.id);

        //get old password, new password, confirmpassword from rew.body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        //validate old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password );
        if(!isPasswordMatch) {
            return res  
                .status(401)
                .json({ success: false, message: 'The password is incorrect'});
        }

        // match new password and confirm new password
        if (newPassword !==  confirmPassword ) {
            return res.status(400).json({
                success: false,
                message:'The password and confirm password does not match',
            })
        }

        //update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate( req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        //send notification email
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            console.error("Error occured while sending email:", error);
            return res.status(500).json({
                success: false,
                message: 'Error occurred while sending email',
                error: error.message,
            });
        }
        return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}