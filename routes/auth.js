const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.route("/me").get(protect, getMe);
router.route("/forgotpassword").post(forgotPassword);

module.exports = router;
