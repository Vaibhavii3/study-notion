const express = require("express")
const router = express.Router()

const { auth } = require("../middlewares/auth")
const { deleteAccount,
        updateDisplayPicture,
        updateProfile,
        getAllUserDetails,
        getEnrolledCourses
} = require("../controllers/Profile")


router.get("/getUserDetails", auth, getAllUserDetails)
router.put("/updateProfile", auth, updateProfile)
router.delete("/deleteProfile", deleteAccount)

router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)

module.exports = router;