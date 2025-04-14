const express = require("express")
const router = express.Router()

const {
    login,
    sendotp,
    signup,
    changePassword,
} = require("../controllers/Auth")

const {
    resetPassword,
    resetPasswordToken,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

router.post("/login", login)
router.post("/signup", signup)
router.post("/sendotp", sendotp)
router.post("/changepassword", auth, changePassword)

router.post("/reset-password-token", resetPasswordToken)

router.post("/reset-password", resetPassword)

module.exports = router;

