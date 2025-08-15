const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");

// Update Course Progress
exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user._id;

  try {
    const subsection = await SubSection.findByPk(subsectionId);
    if (!subsection)
      return res
        .status(404)
        .json({ success: false, message: "Invalid subsection" });

    const courseProgress = await CourseProgress.findOne({
      where: { courseId, userId },
    });
    if (!courseProgress)
      return res
        .status(404)
        .json({ success: false, message: "Course progress does not exist" });

    // Initialize completedVideos if null
    const completedVideos = Array.isArray(courseProgress.completedVideos)
      ? courseProgress.completedVideos
      : [];

    if (completedVideos.includes(subsectionId))
      return res
        .status(400)
        .json({ success: false, message: "Subsection already completed" });

    // Correct way: use set()
    courseProgress.set("completedVideos", [...completedVideos, subsectionId]);
    await courseProgress.save();

    return res
      .status(200)
      .json({ success: true, message: "Course progress updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Progress Percentage
exports.getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user._id;

  if (!courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Course ID not provided." });
  }

  try {
    const courseProgress = await CourseProgress.findOne({
      where: { courseId, userId },
      include: [
        {
          model: Course,
          as: "course", // alias must match your association
          include: [
            {
              model: require("../models/Section"),
              as: "sections",
              include: [{ model: SubSection, as: "subSections" }],
            },
          ],
        },
      ],
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Cannot find course progress for these IDs.",
      });
    }

    const completedVideos = courseProgress.completedVideos || [];
    const sections = courseProgress.course.sections || [];

    let totalLectures = 0;
    sections.forEach((section) => {
      totalLectures += section.subSections.length || 0;
    });

    let progressPercentage = totalLectures
      ? (completedVideos.length / totalLectures) * 100
      : 0;

    progressPercentage = Math.round(progressPercentage * 100) / 100;

    return res.status(200).json({
      success: true,
      data: progressPercentage,
      message: "Successfully fetched course progress",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
