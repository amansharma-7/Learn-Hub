const mailSender = require("../utils/mailSender");
const { contactUsEmail } = require("../mail/templates/contactFormRes");

exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo } = req.body;

  // Validate required fields
  if (!email || !firstname || !lastname || !message || !phoneNo) {
    return res.status(400).json({
      success: false,
      message: "All fields (email, firstname, lastname, message) are required.",
    });
  }

  try {
    // Send an email to the developer
    const developerEmail = "amansharma40732@example.com";
    // Replace with the developer's email
    const developerMessage = `
      A new contact request has been submitted:
      - Name: ${firstname} ${lastname}
      - Email: ${email}
      - Message: ${message}
    `;

    const devEmailRes = await mailSender(
      developerEmail,
      "New Contact Request Received",
      developerMessage
    );

    // Send a success email to the user

    const userEmailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstname, lastname, message)
    );

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    // Respond with error
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while processing your request. Please try again later.",
      error: error.message,
    });
  }
};
