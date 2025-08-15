const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

// Capture the payment and initiate Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user._id;

  if (!courses || courses.length === 0) {
    return res.json({ success: false, message: "Please provide Course IDs" });
  }

  try {
    let totalAmount = 0;

    for (const courseId of courses) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // Check if student is already enrolled
      const enrolledStudents = await course.getStudents();
      if (enrolledStudents.some((s) => s._id === userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Student already enrolled" });
      }

      totalAmount += course.price;
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    const paymentResponse = await instance.orders.create(options);

    res.json({ success: true, data: paymentResponse });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order" });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courses,
  } = req.body;
  const userId = req.user._id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  try {
    await enrollStudents(courses, userId);
    res.status(200).json({
      success: true,
      message: "Payment Verified and Courses Enrolled",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user._id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all payment details" });
  }

  try {
    const student = await User.findByPk(userId);

    await mailSender(
      student.dataValues.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${student.dataValues.firstName} ${student.dataValues.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    res
      .status(200)
      .json({ success: true, message: "Payment success email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not send email",
      error: error.message,
    });
  }
};

// Enroll Students into courses
const enrollStudents = async (courses, userId) => {
  const student = await User.findByPk(userId);

  if (!student) throw new Error("Student not found");

  for (const courseId of courses) {
    const course = await Course.findByPk(courseId);

    if (!course) throw new Error("Course not found");

    // Enroll student to course
    await course.addStudent(student);

    // Create course progress
    const courseProgress = await CourseProgress.create({
      courseId,
      userId,
      completedVideos: [],
    });

    // Send enrollment email
    await mailSender(
      student.email,
      `Successfully Enrolled into ${course.courseName}`,
      courseEnrollmentEmail(
        course.courseName,
        `${student.firstName} ${student.lastName}`
      )
    );
  }
};
