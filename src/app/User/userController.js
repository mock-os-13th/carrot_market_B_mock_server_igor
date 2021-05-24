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
 * [GET] app/users/mobile-check
 */
exports.getMobileCheck = async function (req, res) {

    /**
     * Query String: mobile
     */

     const mobile = req.query.mobile;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    const interimResult = { "interimMessage" : "개발용 임시 인증코드는 1234입니다."}

    return res.send(response(baseResponse.SUCCESS, interimResult));

};

/**
 * API No. 2
 * API Name : 휴대폰 인증번호 확인 API (임시)
 * [POST] app/users/mobile-check
 */

 exports.postMobileCheckSignUp = async function (req, res) {

    /**
     * Body: verificationCode
     */

    const { verificationCode } = req.body;

    // 인증번호 형식적 검증
    const verificationCodeVerification = inputverifier.verifyCode(verificationCode);
    if (!verificationCodeVerification.isValid) return res.send(errResponse(verificationCodeVerification.errorMessage));

    // 인증번호 일치여부 확인
    if (verificationCode === "1234") {
        return res.send(response(baseResponse.SUCCESS)); 
    } else {
        return res.send(errResponse(baseResponse.VERIFICATION_CODE_NOT_MATCH))
    }

};


/**
 * API No. 3
 * API Name : 회원가입 API (닉네임 등록)
 * [POST] app/users/mobile-check
 */
 exports.postUser = async function (req, res) {

    /**
     * Body: nickName
     */

    const { mobile, nickname } = req.body;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // 닉네임 형식적 검증
    const nicknameVerification = inputverifier.verifyNickname(nickname);
    if (!nicknameVerification.isValid) return res.send(errResponse(nicknameVerification.errorMessage));

    // DB에 회원정보 등록
    const signUpResponse = await userService.createUser(
        mobile,
        nickname
    );

    return res.send(signUpResponse);
};


