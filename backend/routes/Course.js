// const express = require("express")
// const router = express.Router()

// const { createCourse, getAllCourses, getCoursesDetails } = require("../controllers/Course")

// const {showAllCategories, createCategory, categoryPageDetails} = require("../controllers/Category")

// const {createSection, updateSection, deleteSection} = require("../controllers/Section")

// const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection")

// const {createRating, getAllRating, getAverageRating} = require("../controllers/RatingAndReview")

// const { auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth")

// //course routes
// router.post("/createCourse", auth, isInstructor, createCourse)
// router.post("/addSection", auth, isInstructor, createSection)
// router.post("/updateSection", auth, isInstructor, updateSection)
// router.post("/deleteSection", auth, isInstructor, deleteSection)
// router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// router.post("/addSubSection", auth, isInstructor, createSubSection)
// router.get("/getAllCourses", getAllCourses)
// router.post("/getCoursesDetails", getCoursesDetails)


// //Category can only be Created by Admin

// router.post("/createCategory", auth, isAdmin, createCategory)
// router.get("/showAllCategories", showAllCategories)
// router.post("/getCategoryPageDetails", categoryPageDetails)

// // Rating and Review 
// router.post("/createRating", auth, isStudent, createRating)
// router.get("/getAverageRating", getAverageRating)
// router.get("/getAllRating", getAllRating)


// module.exports = router

const express = require("express");
const router = express.Router();

// Controllers
const {
  createCourse,
  getAllCourses,
  getCoursesDetails,
} = require("../controllers/Course");

const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updatedSubSection,
  deleteSubSection,
} = require("../controllers/SubSection");

const {
  createRating,
  getAllRating,
  getAverageRating,
} = require("../controllers/RatingAndReview");

// Middleware
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

// Course Routes
router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updatedSubSection", auth, isInstructor, updatedSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
router.get("/getAllCourses", getAllCourses);
router.post("/getCoursesDetails", getCoursesDetails);

// Category Routes (Admin only)
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// Rating and Review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRating", getAllRating);

module.exports = router;
