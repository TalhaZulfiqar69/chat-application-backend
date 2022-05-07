var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth.controller");
const loginValidation = require('../helpers/validation_helper')

router.post("/register", authController.register);
router.get("/verify", authController.accountVerification);
router.get("/login", loginValidation, authController.login);
router.get("/forget/password", authController.forgetPassword);
router.get("/reset/password", authController.resetPassword);

module.exports = router;
