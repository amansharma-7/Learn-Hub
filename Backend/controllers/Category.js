const { Op } = require("sequelize");
const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    await Category.create({ name, description });

    res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating category, please try again",
    });
  }
};

// Get all Categories
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.findAll({
      attributes: ["_id", "name", "description"],
    });

    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      allCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching categories, please try again",
    });
  }
};

// Category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Get selected category with published courses and their instructors
    const selectedCategory = await Category.findByPk(categoryId, {
      include: {
        model: Course,
        as: "courses",
        where: { status: "Published" },
        attributes: [
          "_id",
          "courseName",
          "courseDescription",
          "price",
          "thumbnail",
          "tag",
          "instructions", // <-- explicitly include it
          "status",
          "instructorId",
          "categoryId",
        ],
        include: {
          model: User,
          as: "instructor",
          attributes: ["_id", "firstName", "lastName", "email"],
          required: false,
        },
        required: false,
      },
    });

    if (!selectedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      });
    }

    // Get other categories that have courses
    const categoriesExceptSelected = await Category.findAll({
      where: { _id: { [Op.ne]: categoryId } },
      include: {
        model: Course,
        as: "courses",
        where: { status: "Published" },
        required: true,
      },
    });

    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * categoriesExceptSelected.length
      );
      differentCategory = await Category.findByPk(
        categoriesExceptSelected[randomIndex]._id,
        {
          include: {
            model: Course,
            as: "courses",
            where: { status: "Published" },
            include: {
              model: User,
              as: "instructor",
              attributes: ["_id", "firstName", "lastName", "email"],
            },
            required: false,
          },
        }
      );
    }

    // Get top-selling courses across all categories
    const allCategories = await Category.findAll({
      include: {
        model: Course,
        as: "courses",
        where: { status: "Published" },
        include: {
          model: User,
          as: "instructor",
          attributes: ["_id", "firstName", "lastName", "email"],
        },
        required: false,
      },
    });

    const allCourses = allCategories.flatMap((cat) => cat.courses || []);
    const mostSellingCourses = allCourses
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
