var express = require("express");
var router = express.Router();
const authRouter = require("./users");

/* GET default server response. */
router.get('/', function (req, res) {
    res.status(200).json({
        status: 200,
        success: true,
        message: 'Welcome to chat application APIs',
        data: {},
    });
});

router.use("/api/user", authRouter);

module.exports = router;
