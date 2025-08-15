const Course = require("../models/Course");
const User = require("../models/User");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { Profile } = require("../models");

// Create Course
exports.createCourse = async (req, res) => {
  try {
    let {
      courseName,
      courseDescription,
      whatWillYouLearn,
      price,
      category,
      tag,
      status,
      instructions,
    } = req.body;

    const thumbnail = req.files?.thumbnailImage;
    if (!status) status = "Draft";

    if (
      !courseName ||
      !courseDescription ||
      !whatWillYouLearn ||
      !price ||
      !category ||
      !tag
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Please fill all fields" });
    }

    const categoryDetails = await Category.findByPk(category);
    if (!categoryDetails) {
      return res
        .status(403)
        .json({ success: false, message: "Category details not found" });
    }
    const instructorId = req.user._id;
    const instructor = await User.findByPk(instructorId);
    if (!instructor) {
      return res
        .status(403)
        .json({ success: false, message: "Instructor details not found" });
    }

    const thumbnailImage = thumbnail
      ? await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)
      : null;

    const finalTag = !tag ? [] : typeof tag === "string" ? [tag] : tag;
    const finalInstructions = !instructions
      ? []
      : typeof instructions === "string"
      ? [instructions]
      : instructions;
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatWillYouLearn,
      price,
      categoryId: categoryDetails._id,
      instructorId: instructor._id,
      thumbnail: thumbnailImage?.secure_url,
      tag: finalTag,
      status,
      instructions: finalInstructions,
    });

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};

// Show All Courses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.findAll({
      attributes: ["_id", "courseName", "price", "thumbnail", "tag", "status"],
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["_id", "firstName", "lastName", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to show all Courses",
      error: error.message,
    });
  }
};

// Get Course Details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.query;

    const courseDetails = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: "instructor",
          include: [{ model: Profile, as: "profile" }],
        },
        { model: Category, as: "category" },
        {
          model: Section,
          as: "sections",
          include: [{ model: SubSection, as: "subSections" }],
        },
      ],
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0;

    courseDetails?.Sections?.forEach((section) => {
      section?.SubSections?.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      message: "Course Details fetched successfully",
      totalDuration,
      courseDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Full Course Details with Progress
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user._id;

    const courseDetails = await Course.findByPk(courseId, {
      include: [
        {
          model: User,
          as: "instructor",
          include: [{ model: Profile, as: "profile" }],
        },
        {
          model: Category,
          as: "category", // must match the alias in association
          attributes: ["_id", "name", "description"],
        },
        {
          model: Section,
          as: "sections",
          include: [{ model: SubSection, as: "subSections" }],
        },
      ],
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    const courseProgress = await CourseProgress.findOne({
      where: { courseId, userId },
    });

    let totalDurationInSeconds = 0;
    courseDetails?.Sections?.forEach((section) => {
      section.SubSections?.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgress?.completedVideos || [],
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Edit Course
exports.editCourse = async (req, res) => {
  try {
    const {
      courseId,
      courseName,
      courseDescription,
      whatWillYouLearn,
      price,
      tag,
      Categories,
      instructions,
      status,
    } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    if (courseName) course.courseName = courseName;
    if (courseDescription) course.courseDescription = courseDescription;
    if (whatWillYouLearn) course.whatWillYouLearn = whatWillYouLearn;
    if (price) course.price = price;
    if (status && ["Draft", "Published"].includes(status))
      course.status = status;

    if (Categories) {
      const category = await Category.findByPk(Categories);
      if (!category)
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      course.categoryId = Categories; // ✅ fixed
    }

    const finalTag = !tag ? [] : typeof tag === "string" ? [tag] : tag;
    let finalInstructions = [];
    if (!instructions) {
      finalInstructions = [];
    } else if (typeof instructions === "string") {
      try {
        // Try parsing JSON string from frontend
        const parsed = JSON.parse(instructions);
        finalInstructions = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        // Fallback if it's just a normal string
        finalInstructions = [instructions];
      }
    } else if (Array.isArray(instructions)) {
      finalInstructions = instructions;
    }

    course.tag = finalTag;
    course.instructions = finalInstructions;

    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    await course.save();

    // Fetch updated course with relations
    const updatedCourse = await Course.findByPk(course._id, {
      include: [
        {
          model: Section,
          as: "sections",
          include: [{ model: SubSection, as: "subSections" }],
        },
        { model: User, as: "instructor" },
        { model: Category, as: "category" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Fetch the course with sections and subSections
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Section,
          as: "sections", // match alias in association
          include: [
            {
              model: SubSection,
              as: "subSections", // match alias in association
            },
          ],
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Unenroll all students safely without touching Course.instructorId
    await course.setStudents([]);

    // Delete all sub-sections and sections
    for (const section of course.sections) {
      if (section.subSections && section.subSections.length > 0) {
        await Promise.all(section.subSections.map((sub) => sub.destroy()));
      }
      await section.destroy();
    }

    // Delete the course itself
    await course.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Instructor Courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const instructorCourses = await Course.findAll({
      where: { instructorId },
      include: [{ model: User, as: "instructor" }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: instructorCourses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};
