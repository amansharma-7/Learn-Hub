const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { Section, SubSection } = require("../models");

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, about, contactNumber, gender } =
      req.body;
    const userId = req.user._id; // changed
    const user = await User.findByPk(userId, {
      include: {
        model: Profile,
        as: "profile", // required
      },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await user.update({ firstName, lastName });

    if (user.Profile) {
      await user.Profile.update({ dateOfBirth, about, contactNumber, gender });
    } else {
      await Profile.create({
        userId: user._id, // changed
        dateOfBirth,
        about,
        contactNumber,
        gender,
      });
    }

    const updatedUser = await User.findByPk(userId, {
      include: {
        model: Profile,
        as: "profile", // required
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id; // changed

    const user = await User.findByPk(userId, { include: [Profile, Course] });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Remove user from enrolled courses
    if (user.Courses.length > 0) {
      for (const course of user.Courses) {
        await course.removeStudent(user);
      }
    }

    // Delete user's profile
    if (user.Profile) await user.Profile.destroy();

    // Delete course progress
    await CourseProgress.destroy({ where: { userId } }); // updated

    // Delete user
    await user.destroy();

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not delete user" });
  }
};

// Get all user details
exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user._id; // changed

    const user = await User.findByPk(userId, { include: Profile });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Display Picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user._id; // changed
    const displayPicture = req.files.displayPicture;

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const updatedUser = await User.update(
      { image: image.secure_url },
      { where: { _id: userId }, returning: true, plain: true } // changed
    );

    res.json({
      success: true,
      message: "Image updated successfully",
      data: updatedUser[1], // Sequelize returns [count, updatedRow]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get enrolled courses with progress
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByPk(userId, {
      include: {
        model: Course,
        as: "enrolledCourses",
        include: [
          {
            model: CourseProgress,
            as: "progresses",
            where: { userId },
            required: false,
          },
          {
            model: Section,
            as: "sections",
            include: { model: SubSection, as: "subSections" },
          },
        ],
      },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const coursesData = [];

    for (const course of user.enrolledCourses) {
      let totalDurationInSeconds = 0;
      let totalSubsections = 0;

      for (const section of course.sections || []) {
        totalDurationInSeconds += (section.subSections || []).reduce(
          (acc, sub) => acc + parseInt(sub.timeDuration || 0),
          0
        );
        totalSubsections += (section.subSections || []).length;
      }

      const progress = course.progresses?.[0];
      const completed = progress?.completedVideos?.length || 0;

      const progressPercentage =
        totalSubsections === 0
          ? 100
          : Math.round((completed / totalSubsections) * 100 * 100) / 100;

      coursesData.push({
        ...course.toJSON(),
        totalDuration: convertSecondsToDuration(totalDurationInSeconds),
        progressPercentage,
      });
    }

    res.status(200).json({ success: true, data: coursesData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const courses = await Course.findAll({
      where: { instructorId: userId },
      include: [
        {
          model: User,
          as: "students", // make sure it matches your association
          attributes: ["_id"], // only fetch necessary fields
          through: { attributes: [] }, // omit junction table fields
        },
      ],
    });

    const courseStats = courses.map((course) => {
      const totalStudentsEnrolled = course.students?.length || 0;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      return {
        id: course.id, // use `id` unless your model has `_id`
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
    });

    res.status(200).json({ courses: courseStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
