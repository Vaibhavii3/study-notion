const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section ObjectId

        const updateCourse = await Course.findByIdAndUpdate(courseId, {
            $push:{courseContent:newSection._id,}
        },{new:true},).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();


        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updateCourse,
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, Please try again',
            error:error.message,
        });
    }
}

exports.updateSection = async(req, res) => {
    try{
        //data input
        const {sectionName, sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return res
        return res.status(200).json({
            success:true,
            message:section,
        });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:error.message,
        })
    }
};

exports.deleteSection = async(req, res) => {
    try{
        //get Id - assuming that we are sending id in params
        const {sectionId} = req.params
        await Section.findByIdAndDelete(sectionId);

        //testing - do we need to delete the entry from th course schema

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error:error.message,
        });
    }
}