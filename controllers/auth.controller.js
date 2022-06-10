const saltRounds = 10;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const models = require('../models/index');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const ResponseHelper = require('../helpers/response_helper');
const { validationResult, matchedData } = require('express-validator');

class AuthController {
    /**
     * @param req request body
     * @param res callback response object
     * @description Method to register
     * @date 17 May 2022
     * @updated 17 May 2022
     */
    static register = async (req, res) => {
        let response = ResponseHelper.getResponse({
            status: 400,
            success: false,
            message: 'Something went wrong',
            data: {},
        });

        const t = await sequelize.transaction();
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                response.message = validationErrors[0].msg;
                return;
            }

            const validatedData = matchedData(req);
            const { email, name } = validatedData;
            const hashedPassword = bcrypt.hashSync(
                validatedData.password,
                saltRounds
            );
            const token = jwt.sign(
                { email: validatedData.email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '1h',
                }
            );
            const user = await models.User.create(
                {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    verification_token: token,
                    is_verified: 0,
                },
                { transaction: t }
            );

            if (user) {
                let transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.MAIL_AUTH_USER, // generated ethereal user
                        pass: process.env.MAIL_AUTH_PASSWORD, // generated ethereal password
                    },
                });
                let info = await transporter.sendMail({
                    from: 'Chat application', // sender address
                    to: email, // list of receivers
                    subject: 'Account verification email ✔', // Subject line
                    html: `This email is regarding the account verification from chat application. Please click the link <a href='http://localhost:3000/account/verification/${token}'>Account Verification</a> to verify you account. Thank you.`, // html body
                });


                if (info?.messageId) {
                    response.status = 200;
                    response.success = true;
                    response.message =
                        'Account created successfully and a verification email send to your email please follow the instructions in email to verify your account.';
                    t.commit();
                }
            }
        } catch (error) {
            t.rollback();
            response.status = 500;
            response.success = false;
            response.message = error;
        } finally {
            return res.status(response.status).json(response);
        }
    };

    /**
     * @param req request body
     * @param res callback response object
     * @description Method to login
     * @date 17 May 2022
     * @updated 17 May 2022
     */

    static login = async (req, res) => {
        let response = ResponseHelper.getResponse({
            status: 400,
            success: false,
            message: 'Something went wrong',
            data: {},
        });
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                response.message = validationErrors[0].msg;
                return;
            }

            const validatedData = matchedData(req);

            const { email, password } = validatedData;
            const user = await models.User.findOne({
                where: { email: email },
            });

            const verifyPassword = bcrypt.compareSync(password, user.password);

            if (!verifyPassword) {
                response.message = 'Email or password is incorrect.';
                response.status = 400;
                return;
            }

            if (user.is_verified == 0) {
                response.message = 'Account is not verified. Please verify your account to continue.';
                response.status = 400;
                return;
            }
            const token = jwt.sign(
                { email: user.email },
                process.env.TOKEN_KEY,
                { expiresIn: '1h' }
            );
            const logedin_user = {
                id: user.id,
                name: user.name,
                email: user.email,
                is_verified: user.is_verified,
                profile_picture: user.profile_picture,
                token: token,
                created_at: user.created_at,
                updated_at: user.updated_at,
            };
            response.success = true;
            response.message = 'Login successfully.';
            response.data = logedin_user;
            response.status = 200;
        } catch (err) {
            response.message = 'An exception error occured.';
            response.status = 500;
        } finally {
            return res.status(response.status).json(response);
        }
    };

    /**
     * @param req request body
     * @param res callback response object
     * @description Method to account verification
     * @date 17 May 2022
     * @updated 17 May 2022
     */

    static accountVerification = async (req, res) => {
        let response = ResponseHelper.getResponse({
            status: 400,
            success: false,
            message: 'Something went wrong',
            data: {},
        });
        const t = await sequelize.transaction();
        try {

            const { verification_token } = req.body;

            if (!verification_token) {
                response.message = 'Verification token is required.';
                response.status = 400;
                return;
            }

            const user = await models.User.findOne({
                where: { verification_token: verification_token },
            });

            if (!user ||
                user.verification_token == null ||
                user.is_verified == 1
            ) {
                response.message = 'Verification token is invalid or expired.';
                response.status = 400;
                return;
            }

            var is_token_verified = jwt.verify(user.verification_token, process.env.TOKEN_KEY);

            if (!is_token_verified) {
                response.message = 'Verification token is invalid or expired.';
                response.status = 404;
                return;
            }


            const updateUser = await models.User.update(
                { is_verified: 1, verification_token: "" },
                { where: { id: user.id } },
                {
                    transaction: t,
                }
            );

            if (updateUser) {
                response.success = true;
                response.message = 'Account verified successfully.';
                response.status = 200;
                t.commit();
            }

        } catch (err) {
            response.message = err;
            response.status = 500;
        } finally {
            return res.status(response.status).json(response);
        }
    };

    static forgetPassword = async (req, res) => {
        let response = ResponseHelper.getResponse({
            status: 400,
            success: false,
            message: 'Something went wrong',
            data: {},
        });

        const t = await sequelize.transaction();
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                response.message = validationErrors[0].msg;
                return;
            }

            const validatedData = matchedData(req);
            const { email } = validatedData;

            const token = jwt.sign(
                { email: email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '1h',
                }
            );

            const updateUser = await models.User.update(
                { forget_password_token: token },
                { where: { email: email } },
                {
                    transaction: t,
                }
            );

            if (updateUser) {

                let transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.MAIL_AUTH_USER, // generated ethereal user
                        pass: process.env.MAIL_AUTH_PASSWORD, // generated ethereal password
                    },
                });
                let info = await transporter.sendMail({
                    from: 'Chat application', // sender address
                    to: email, // list of receivers
                    subject: 'Reset password email ✔', // Subject line
                    html: `This email is regarding the reset password request from chat application. Please click the link <a href='http://localhost:3000/change/password/${token}'>Change Password</a> . Thank you.`, // html body
                });


                if (info?.messageId) {
                    response.status = 200;
                    response.success = true;
                    response.message =
                        'Forget password instructions send to your email address. Please follow instructions to reset your password.';
                    t.commit();
                }
            }
        } catch (error) {
            t.rollback();
            response.status = 500;
            response.success = false;
            response.message = error;
        } finally {
            return res.status(response.status).json(response);
        }
    };

    static resetPassword = async (req, res) => {
        let response = ResponseHelper.getResponse({
            status: 400,
            success: false,
            message: 'Something went wrong',
            data: {},
        });

        const t = await sequelize.transaction();
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                response.message = validationErrors[0].msg;
                return;
            }

            const validatedData = matchedData(req);
            const { password } = validatedData;
            const { token } = req.body;

            const findUser = await models.User.findOne({ where: { forget_password_token: token } })



            if (!findUser) {
                response.status = 400;
                response.success = false;
                response.message =
                    'Invalid token.';
                return;
            }

            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const updatePassword = await models.User.update(
                { password: hashedPassword, forget_password_token: "" },
                { where: { email: findUser.email } },
                {
                    transaction: t,
                }
            );


            if (updatePassword) {
                response.status = 200;
                response.success = true;
                response.message =
                    'Password changed successfully.';
                t.commit();
            }
        } catch (error) {

            t.rollback();
            response.status = 500;
            response.success = false;
            response.message = error;
        } finally {
            return res.status(response.status).json(response);
        }
    };
}

module.exports = AuthController;
