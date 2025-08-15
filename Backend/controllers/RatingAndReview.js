const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");

// Create rating and review
exports.createRating = async (req, res) => {
  try {
    const userId = req.user._id; // changed
    const { rating, review, courseId } = req.body;

    // Check if student is enrolled in course
    const course = await Course.findOne({
      where: { _id: courseId }, // changed
      include: {
        model: User,
        as: "students", // match association alias
        where: { _id: userId }, // changed
        required: false,
      },
    });

    if (!course || course.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = await RatingAndReview.findOne({
      where: { userId, courseId }, // keep _id mapping in model
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }

    // Create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      courseId,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Rating and Review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get average rating for a course
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    const result = await RatingAndReview.findAll({
      attributes: [
        [
          RatingAndReview.sequelize.fn(
            "AVG",
            RatingAndReview.sequelize.col("rating")
          ),
          "averageRating",
        ],
      ],
      where: { courseId }, // ensure field names match model
    });

    const averageRating = parseFloat(result[0].get("averageRating")) || 0;

    res.status(200).json({
      success: true,
      averageRating,
      message: averageRating === 0 ? "No ratings given till now" : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all ratings and reviews
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.findAll({
      include: [
        {
          model: User,
          as: "user", // match alias in association
          attributes: ["firstName", "lastName", "email", "image"],
        },
        {
          model: Course,
          as: "course", // match alias in association
          attributes: ["courseName"],
        },
      ],
      order: [["rating", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
