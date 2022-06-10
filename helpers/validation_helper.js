const { body, check, validationResult } = require('express-validator');
const models = require('../models/index');
/***************************************************************************
 *********** Common validations for all api requests starts here ***********
 ***************************************************************************/

// Common validations
let email = check('email')
    .notEmpty()
    .withMessage((value, { req }) => {
        return 'Email is required.';
    })
    .isEmail()
    .withMessage((value, { req }) => {
        return 'Invalid email address.';
    })
    .trim()
    .normalizeEmail()
    .custom((value, { req }) => {
        return models.User.findOne({ where: { email: value } }).then((user) => {
            if (user) {
                throw new Error('Email is already registered.');
            }
            return true;
        });
    });
let password = check('password')
    .notEmpty()
    .withMessage((value, { req }) => {
        return 'Password is required';
    })
    .isLength({ min: 8 })
    .withMessage((value, { req }) => {
        return 'Password length must be minimum 8 characters.';
    })
    .matches(/\d/)
    .withMessage((value, { req }) => {
        return 'Password must contain 1 number.';
    });
let confirmPassword = check('confirmPassword')
    .notEmpty()
    .withMessage((value, { req }) => {
        return 'Confirm password is missing.';
    })
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password.');
        }
        return true;
    });
/***************************************************************************
 ************ Common validations for all api requests ends here ************
 ***************************************************************************/
const registrationValidation = [
    email,
    password,
    confirmPassword,
    check('name')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Name is required.';
        }),
];

const loginValidation = [
    check('email')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Email is required.';
        })
        .isEmail()
        .withMessage((value, { req }) => {
            return 'Invalid email addredd.';
        })
        .trim()
        .normalizeEmail()
        .custom((value, { req }) => {
            return models.User.findOne({ where: { email: value } }).then((user) => {
                if (!user) {
                    throw new Error('This email does not belong to any account.');
                }
                return true;
            });
        }),
    check('password')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Password is missing.';
        }),
];


const forgetPasswordVAlidation = [
    check('email')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Email is required.';
        })
        .isEmail()
        .withMessage((value, { req }) => {
            return 'Invalid email addredd.';
        })
        .trim()
        .normalizeEmail()
        .custom((value, { req }) => {
            return models.User.findOne({ where: { email: value } }).then((user) => {
                if (!user) {
                    throw new Error('This email does not belong to any account.');
                }
                return true;
            });
        }),
];

const resetPasswordVAlidation = [
    password,
    confirmPassword,
    // check('oldPassword')
    //     .notEmpty()
    //     .withMessage((value, { req }) => {
    //         return 'Old password is required.';
    //     })
];

module.exports = {
    registrationValidation,
    loginValidation,
    forgetPasswordVAlidation,
    resetPasswordVAlidation
}
