const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (mobile, nickname) {
    try {
        // 휴대폰 번호 중복 확인
        const mobileRows = await userProvider.checkMobile(mobile);
        if (mobileRows.length > 0)
            return errResponse(baseResponse.REDUNDANT_MOBILE); // 에러 메시지

        // 닉네임 중복 확인
        const nicknameRows = await userProvider.checkNickname(nickname);
        if (nicknameRows.length > 0)
            return errResponse(baseResponse.REDUNDANT_NICKNAME); // 에러 메시지

        // DB에 회원정보 입력
        const insertUserInfoParams = [mobile, nickname];
        const connection = await pool.getConnection(async (conn) => conn);
        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams); // 함수
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();

        // user idx 구하고 jwt 토큰 반환
        const getNewUserIdx = await userProvider.checkMobile(mobile);
        const newUserIdx = getNewUserIdx[0].idx

        let token = await jwt.sign(
            {
                userIdx: newUserIdx
            }, // 토큰의 내용(payload)
            process.env.JWT_SECRET_KEY, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, token)

    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
