const Course = require("../models/Course");
const Category = require("../models/Category");
const Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse

exports.createCourse = async(req, res) => {
    try {
        //fetch data
        const userId = req.user.id;

        // const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            // tag,
            category,
            status,
            instructions,
        } = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !category) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        if (!status || status === undefined) {
            status = "Draft";
        }

        //check for instructor
        // const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });
        console.log("Instructor Details:", instructorDetails);

        if(!instructorDetails) {
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        //

        //tag validation
        // const tagDetails = await Tag.findById(tag);
        // if(!tagDetails) {
        //     return res.status(404).json({
        //         success:false,
        //         message:'Tag Details not found',
        //     });
        // }

        //category validation
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
            });
        }

        //Upload Image top Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.Folder_NAME);

        //create an enrty for new cource
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            // tag:tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        //add new course to the categories
        await Category.findByIdAndUpdate(
            {_id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            {new: true}
        );

        //tag schema pending

        return res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error: error.message,
        })
    }
};

//getAllCourses

exports.getAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor")
            .exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch couse data',
            error:error.message,
        })
    }
};

//getcourseDetails
exports.getCoursesDetails = async(req, res) => {
    try {
        //get id 
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find(
            {_id:courseId}
        ).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails",
            },
        }).populate("category")
        .populate("ratingAndreviews").populate({
            path:"courseContent",
            populate:{
                path:"subsection",
            }
        })
        .exec();
        //validation
        if(!courseDetails) {
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }
        //return response
        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully",
            data:courseDetails,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}