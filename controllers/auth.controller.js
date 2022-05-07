const saltRounds = 10;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const models = require("../models/index");
const Sequelize = require('sequelize');
const sequelize = require("../config/database");
const ResponseHelper = require("../helpers/response_helper");
const { validationResult, matchedData } = require('express-validator');

class AuthController {

    /**
     * @param req request body
     * @param res callback response object
     * @description Method to register
     * @date 07 May 2022
     * @updated 07 May 2022
    */
    static register = async (req, res) => {
        let data;
        let status;
        let message;
        let success;
        // const t = await sequelize.transaction();
        try {
            const { name, email, password, confirmPassword } = req.body;
            if (password !== confirmPassword) {
                status = 400;
                success = false;
                message = "Password and confirm password not matched.";
            } else {
                // const hashedPassword = bcrypt.hashSync(password, saltRounds);

                // console.log("hashedPassword :", hashedPassword);
                // const token = jwt.sign({ email: email }, process.env.TOKEN_KEY, {
                //   expiresIn: "1h",
                // });
                // console.log("token :", token);
                // const user = await models.User.create(
                //   {
                //     name: name,
                //     email: email,
                //     password: hashedPassword,
                //     verification_token: token,
                //   },
                //   { transaction: t }
                // );

                // status = 200;
                // success = true;
                // responseMessage =
                //   "Account created successfully and a verification email send to your email please follow the instructions in email to verify your account.";
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: "alan.mcglynn63@ethereal.email", // generated ethereal user
                        pass: "WwGRk7cXbx3MtGeqA2", // generated ethereal password
                    },
                });
                let info = await transporter.sendMail({
                    from: '"Fred Foo 👻" <foo@example.com>', // sender address
                    to: email, // list of receivers
                    subject: "Hello ✔", // Subject line
                    text: "Hello world?", // plain text body
                    html: "<b>Hello world?</b>", // html body
                });

                console.log("info :", info);
                // t.commit();

                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                status = 200;
                success = true;
                responseMessage =
                    "Account created successfully and a verification email send to your email please follow the instructions in email to verify your account.";
            }
        } catch (error) {
            //   t.rollback();
            console.log("error :", error);
            status = 500;
            success = false;
            message = "Something went wrong, please try again later.";
        } finally {
            res.send(
                ResponseHelper.getResponse({
                    statusCode: status,
                    success: success,
                    responseMessage: message,
                })
            );
        }
    };

    /**
     * @param req request body
     * @param res callback response object
     * @description Method to login
     * @date 07 May 2022
     * @updated 07 May 2022
    */

    static login = async (req, res) => {
        let response = ResponseHelper.getResponse(
            false,
            'Something went wrong',
            {},
            400
        );
        const t = await sequelize.transaction();
        try {
            const { password } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                response.message = validationErrors[0].msg;
            } else {
                const validatedData = matchedData(req);
                const { email } = validatedData;
                const user = await models.User.findOne({
                    where: { email: email, user_type: 'admin' },
                });
                if (user) {
                    const verifyPassword = bcrypt.compareSync(password, user.password);
                    if (verifyPassword == false) {
                        response.message = MessageHelper.getMessage(
                            'incorrect_password_error',
                            language
                        );
                    } else {
                        if (user.is_verified == 0) {
                            response.message = MessageHelper.getMessage(
                                'account_not_verified_message',
                                language
                            );
                        } else {
                            const token = jwt.sign(
                                { email: user.email },
                                meducomConfig.custom.jwtSecretString,
                                { expiresIn: '1h' }
                            );
                            const admin_user = {
                                id: user.id,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                email: user.email,
                                user_type: user.user_type,
                                city: user.city,
                                province: user.province,
                                token: token,
                                created_at: user.created_at,
                                updated_at: user.updated_at,
                            };
                            response.success = true;
                            response.message = "Login successfully.";
                            response.data = admin_user;
                            response.status = 200;
                        }
                    }
                } else {
                    response.message = "This email does not belong to any account.";
                }
            }
        } catch (err) {
            await t.rollback();
            console.log('error', err);
            response.message = "An exception error occured.";
            response.statue = 500;
        } finally {
            return res.status(response.status).json(response);
        }
    };

    static accountVerification = async (req, res) => {
        console.log("this is accountVerification !!");
    };

    static forgetPassword = async (req, res) => {
        console.log("this is forgetPassword !!");
    };

    static resetPassword = async (req, res) => {
        console.log("this is resetPassword !!");
    };
}

module.exports = AuthController;
