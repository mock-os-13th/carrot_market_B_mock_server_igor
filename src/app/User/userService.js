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

// 회원 가입
exports.createUser = async function (mobile, nickname, pictureId, pictureUrl) {
    try {
        // 휴대폰 번호 중복 확인
        const mobileRows = await userProvider.checkMobile(mobile);
        if (mobileRows.length > 0 && mobileRows[0].status === "VALID") { // 이미 있는 회원이면
            return errResponse(baseResponse.REDUNDANT_MOBILE);
        } else if (mobileRows.length > 0 && mobileRows[0].status === "DELETED") { // 이미 삭제 회원이면
            if (mobileRows[0].isRemakable === "NO") // 그런데 1주일이 안지나서 다시 가입라려고 하면
                return errResponse(baseResponse.REJOIN_TOO_SOON);
        }
            

        // // 닉네임 중복 확인
        // const nicknameRows = await userProvider.checkNickname(nickname);
        // if (nicknameRows.length > 0)
        //     return errResponse(baseResponse.REDUNDANT_NICKNAME); 
            // 중복 닉네임이 가능한 것으로 판단되어 주석처리

        // DB에 회원정보 입력
        const insertUserInfoParams = [mobile, nickname, pictureId, pictureUrl];
        const connection = await pool.getConnection(async (conn) => conn);
        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();

        // user idx 구하고 jwt 토큰 반환
        const newUserIdx = userIdResult[0].insertId

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
        
        jwtResult = { "jwt": token }
        return response(baseResponse.SUCCESS, jwtResult)

    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 회원 탈퇴
exports.deleteUser = async function (userIdx) {
    try {
        // 존재하는 회원인지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // DB에 회원정보 수정
        const connection = await pool.getConnection(async (conn) => conn);
        const updateUserStatusResult = await userDao.updateUserStatus(connection, userIdx); 
        console.log(`삭제된 회원 : ${updateUserStatusResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - patchUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
