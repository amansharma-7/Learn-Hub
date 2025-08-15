const sequelize = require("../config/database");
const User = require("./User");
const Profile = require("./Profile");
const Course = require("./Course");
const Category = require("./Category");
const Section = require("./Section");
const SubSection = require("./SubSection");
const RatingAndReviews = require("./RatingAndReview");
const CourseProgress = require("./CourseProgress");
const OTP = require("./OTP");

// ----------------- Associations -----------------

// Profile ↔ User
Profile.hasOne(User, { foreignKey: "profileId", as: "user" });
User.belongsTo(Profile, { foreignKey: "profileId", as: "profile" });

// Course instructor
Course.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });
User.hasMany(Course, { foreignKey: "instructorId", as: "courses" });

// Course ↔ Category
Course.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Course, { foreignKey: "categoryId", as: "courses" });

// Students enrolled in courses (many-to-many)
User.belongsToMany(Course, {
  through: "user_courses",
  as: "enrolledCourses",
  foreignKey: "userId",
});
Course.belongsToMany(User, {
  through: "user_courses",
  as: "students",
  foreignKey: "courseId",
});

// Course ↔ Section ↔ SubSection
Course.hasMany(Section, { foreignKey: "courseId", as: "sections" });
Section.belongsTo(Course, { foreignKey: "courseId", as: "course" });
Section.hasMany(SubSection, { foreignKey: "sectionId", as: "subSections" });
SubSection.belongsTo(Section, { foreignKey: "sectionId", as: "section" });

// Course ↔ RatingAndReviews
Course.hasMany(RatingAndReviews, { foreignKey: "courseId", as: "reviews" });
RatingAndReviews.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User ↔ RatingAndReviews
User.hasMany(RatingAndReviews, { foreignKey: "userId", as: "userReviews" });
RatingAndReviews.belongsTo(User, { foreignKey: "userId", as: "user" });

// ----------------- CourseProgress -----------------
// User ↔ CourseProgress (one user can have many progresses)
User.hasMany(CourseProgress, { foreignKey: "userId", as: "courseProgresses" });
CourseProgress.belongsTo(User, { foreignKey: "userId", as: "student" });

// Course ↔ CourseProgress (one course can have many progresses)
Course.hasMany(CourseProgress, { foreignKey: "courseId", as: "progresses" });
CourseProgress.belongsTo(Course, { foreignKey: "courseId", as: "course" });

module.exports = {
  sequelize,
  User,
  Profile,
  Course,
  Category,
  Section,
  SubSection,
  RatingAndReviews,
  CourseProgress,
  OTP,
};
