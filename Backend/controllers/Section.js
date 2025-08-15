const { Section, Course, SubSection } = require("../models");

// CREATE a new section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }

    // Create a new section with courseId
    const newSection = await Section.create({ sectionName, courseId });

    const updatedCourse = await Course.findByPk(courseId, {
      include: {
        model: Section,
        as: "sections",
        include: { model: SubSection, as: "subSections" },
      },
    });

    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    const section = await Section.findByPk(sectionId);
    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    section.sectionName = sectionName;
    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    // Include SubSections using alias
    const section = await Section.findByPk(sectionId, {
      include: { model: SubSection, as: "subSections" },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Delete all subsections
    if (section.subSections && section.subSections.length > 0) {
      await SubSection.destroy({
        where: { _id: section.subSections.map((s) => s._id) },
      });
    }

    // Delete section directly
    await section.destroy();

    // Reload updated course with sections and subsections (using aliases)
    const updatedCourse = await Course.findByPk(courseId, {
      include: {
        model: Section,
        as: "sections",
        include: { model: SubSection, as: "subSections" },
      },
    });

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
