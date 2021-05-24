const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


/**
 * API No. 1
 * API Name : 휴대폰 인증번호 받기 API (임시)
 * [GET] /users/mobile-check
 */
exports.getMobileCheck = async function (req, res) {

    /**
     * Body: mobile
     */

    const { mobile } = req.body;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(response(mobileVerification.errorMessage));

    const interimResult = { "interimMessage" : "개발용 임시 인증코드는 1234입니다."}

    return res.send(response(baseResponse.SUCCESS, interimResult));
};






