const express = require("express")
const router = express.Router()

const { createCourse, getAllCourses, getCourseDetails, } = require("../controllers/Course")

const {createCourse, getAllCourses, getCourseDetails} = require("../controllers/Category")

const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection")

const {createRating, getAllRating, getAverageRating} = require("../controllers/RatingAndReview")

const { auth, isInstuctor, isStudent, isAdmin} = require("../middlewares/auth")

//course routes
router.post("/createCourse", AuthenticatorAssertionResponse, isInstuctor, createCourse)
router.post("/addSection", auth, isInstuctor, createSection)
router.post("/updateSection", auth, isInstuctor, updateSection)
router.post("/deleteSection", auth, isInstuctor, deleteSection)
router.post("/updateSubSection", auth, isInstuctor, updateSubSection)
router.post("/deleteSubSection", auth, isInstuctor, deleteSubSection)
router.post("/addSubSection", auth, isInstuctor, createSubSection)
router.get("/getAllCourses", getAllCourses)
router.post("/getCoursesDetails", getCourseDetails)


//Category can only be Created by Admin

router.post("/createCategory", AuthenticatorAssertionResponse, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPAgeDetails", categoryPageDetails)

// Rating and Review 
router.post("/createRating", AuthenticatorAssertionResponse, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getAllRating", getAllRatingReview)


module.exports = router