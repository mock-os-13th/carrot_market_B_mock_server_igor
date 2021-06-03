const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const userProvider = require('./userProvider')
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

// 동일한 닉네임이 있는지 체크 
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
exports.getUserIdx = async function (mobile) {
  const connection = await pool.getConnection(async (conn) => conn);
  
  try {
    const getUserResult = await userDao.selectUserDetailMobile(connection, mobile);
  
    // 휴대폰 번호 중복여부 확인
    if (getUserResult.length > 1)
      return errResponse(baseResponse.OVERLAPPING_MOBILE); 
  
    // 존재하지 않는 회원인지 확인
    if (getUserResult.length < 1)
     return errResponse(baseResponse.USER_NOT_EXIST); 
  
    // jwt 토큰 생성
    const userIdx = getUserResult[0].idx

    return (userIdx)

  } catch(error) {
    logger.error(`App - getUser Provider error\n: ${error.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// userIdx로 닉네임 가져오기
exports.retrieveUserNickname = async function(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveUserNicknameResult = await userDao.selectNicknameIdx(connection, userIdx);
  connection.release();
  return retrieveUserNicknameResult; 
}

// userIdx로 간략한 회원정보 가져오기 (나의 당근 메인페이지용)
exports.retrieveUser = async function (userIdx) {

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectUserIdxResult = await userDao.selectUserIdx(connection, userIdx);
    connection.release();

    // 존재하지 않는 회원인지 확인
    if (selectUserIdxResult.length < 1)
      return errResponse(baseResponse.USER_NOT_EXIST); 
    
    return response(baseResponse.SUCCESS, selectUserIdxResult[0])
  
  } catch(error) {
    logger.error(`App - getUser Service error\n: ${error.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// userIdx로 userLocation 정보 가져오기 (자동 로그인용)
exports.getUserLocations = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  
  try {
    const checkUserStatusResult = await userDao.selectUserStatusIdx(connection, userIdx);
  
    // 존재하지 않는 회원인지 확인
    if (checkUserStatusResult.length < 1)
     return errResponse(baseResponse.USER_NOT_EXIST); 
    
    // 반환할 회원 위치 조회 (idx, villageIdx, dong, villageRangeLevel, isAuthorized)
    const userLocations = await userDao.selectUserLocation(connection, userIdx);    
    return userLocations
  
  } catch(error) {
    logger.error(`App - getUser Service error\n: ${error.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 판매 중인 물품 목록 조회
exports.retrieveSellingItem = async function (userIdx) {
  // userIdx 형식적 검증
  const userStatusRows = await userProvider.checkUserStatus(userIdx);
  if (userStatusRows.length < 1)
      return errResponse(baseResponse.USER_NOT_EXIST);

  // 판매 중인 물건 List
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveSellingItemResult = await userDao.selectSellingItemsUser(connection, userIdx);
  connection.release();

  return response(baseResponse.SUCCESS, retrieveSellingItemResult);
};

// 판매내역 조회
exports.retrieveSoldItem = async function (userIdx) {
  // userIdx 형식적 검증
  const userStatusRows = await userProvider.checkUserStatus(userIdx);
  if (userStatusRows.length < 1)
      return errResponse(baseResponse.USER_NOT_EXIST);

  // 판매 내역 List
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveSoldItemResult = await userDao.selectSoldItemsUser(connection, userIdx);
  connection.release();

  return response(baseResponse.SUCCESS, retrieveSoldItemResult);
};

// 구매내역 조회
exports.retrievePurchasedItem = async function (userIdx) {
  // userIdx 형식적 검증
  const userStatusRows = await userProvider.checkUserStatus(userIdx);
  if (userStatusRows.length < 1)
      return errResponse(baseResponse.USER_NOT_EXIST);

  // 구매 내역 List
  const connection = await pool.getConnection(async (conn) => conn);
  const retrievePurchasedItemResult = await userDao.selectPurchasedItemsUser(connection, userIdx);
  connection.release();

  return response(baseResponse.SUCCESS, retrievePurchasedItemResult);
};

// userIdx로 프로필 가져오기 (상대방 프로필 조회용)
exports.retrieveUserProfile = async function (userIdx, targetIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  
  try {
    // userIdx 형식적 검증
    const userStatusRows = await userProvider.checkUserStatus(userIdx);
    if (userStatusRows.length < 1)
        return errResponse(baseResponse.USER_NOT_EXIST);

    const selectUserDetailIdxResult = await userDao.selectUserDetailIdx(connection, targetIdx);
  
    // 존재하지 않는 회원인지 확인
    if (selectUserDetailIdxResult.length < 1)
     return errResponse(baseResponse.USER_NOT_EXIST); 
  
    // userLocation 넣기
    let userProfile = selectUserDetailIdxResult[0]
    const userLocationsForProfile = await userDao.selectUserLocationNumOfAuthorization(connection, targetIdx, userIdx)
    userProfile.userLocation = userLocationsForProfile

    // 더미데이터 넣기 (홀수와 짝수 다르게)
    if (userIdx % 2 == 1) {
      userProfile.reDealHopeRate = 99.9
      userProfile.numOfTotalDeals = 1000
      userProfile.numOfGoodDeals = 999
      userProfile.answerRate = 99.9
      userProfile.answerSpeed = "1시간"
      userProfile.recentActivePeriod = "3일"
      userProfile.numOfBadges = 99
    } else {
      userProfile.reDealHopeRate = 0
      userProfile.numOfTotalDeals = 0
      userProfile.numOfGoodDeals = 0
      userProfile.answerRate = 0
      userProfile.answerSpeed = "불충분"
      userProfile.recentActivePeriod = "없음"
      userProfile.numOfBadges = 0
    }
    
    return response(baseResponse.SUCCESS, userProfile)
  
  } catch(error) {
    logger.error(`App - retrieveUserProfile Service error\n: ${error.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};
