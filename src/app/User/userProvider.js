const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const userDao = require("./userDao");
require("dotenv").config();

const jwt = require("jsonwebtoken");

// Provider: Read 비즈니스 로직 처리

// 동일한 휴대폰 번호이 있는지 체크 
exports.checkMobile = async function (mobile) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkMobileResult = await userDao.selectUserMobile(connection, mobile);
  connection.release();

  return checkMobileResult;
};

//  동일한 닉네임이 있는지 체크 
exports.checkNickname = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkNicknameResult = await userDao.selectUserNickname(connection, nickname);
  connection.release();

  return checkNicknameResult;
};

// 회원 상태 체크
exports.checkUserStatus = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkUserStatusResult = await userDao.selectUserStatusIdx(connection, userIdx);
  connection.release();

  return checkUserStatusResult;
};

// 휴대폰 번호로 userIdx 가져오기
exports.getUser = async function (mobile) {

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const getUserResult = await userDao.selectUserDetailMobile(connection, mobile);
    connection.release();
  
    // 휴대폰 번호 중복여부 확인
    if (getUserResult.length > 1)
      return errResponse(baseResponse.OVERLAPPING_MOBILE); 
  
    // 존재하지 않는 회원인지 확인
    if (getUserResult.length < 1)
    return errResponse(baseResponse.USER_NOT_EXIST); 
  
    // jwt 토큰 생성
    const userIdx = getUserResult[0].idx
    
    let token = await jwt.sign(
      {
          userIdx: userIdx
      }, // 토큰의 내용(payload)
      process.env.JWT_SECRET_KEY, // 비밀키
      {
          expiresIn: "365d",
          subject: "userInfo",
      } // 유효 기간 365일
      );
  
    // 반환할 회원 위치 조회 (idx, villageIdx, dong, villageRangeLevel, isAuthorized)
    const userLocations = await userDao.selectUserLocation(connection, userIdx);
    connection.release();
  
    const loginResult = {"jwt": token, "userLocations": userLocations}
    
    return response(baseResponse.SUCCESS, loginResult)
  
  } catch(error) {
    logger.error(`App - getUser Service error\n: ${error.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};