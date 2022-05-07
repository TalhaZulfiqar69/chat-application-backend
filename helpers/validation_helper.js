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
    check('firstName')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'First name is required.';
        }),
    check('lastName')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Last name is required.';
        }),
    check('city')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'City is required.';
        }),
    check('province')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'Province field is required.';
        }),
    check('userType')
        .notEmpty()
        .withMessage((value, { req }) => {
            return 'User type is required.';
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

module.exports = [
    registrationValidation,
    loginValidation,
]
