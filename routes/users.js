var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth.controller");
const {
    loginValidation,
    registrationValidation,
    forgetPasswordVAlidation,
    resetPasswordVAlidation
} = require('../helpers/validation_helper');

router.post("/register", registrationValidation, authController.register);
router.get("/login", loginValidation, authController.login);
router.post("/verify", authController.accountVerification);
router.post("/forget/password", forgetPasswordVAlidation, authController.forgetPassword);
router.post("/reset/password", resetPasswordVAlidation, authController.resetPassword);

module.exports = router;
