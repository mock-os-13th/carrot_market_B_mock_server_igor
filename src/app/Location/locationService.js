const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const locationProvider = require("./locationProvider");
const locationDao = require("./locationDao");
const userProvider = require('../User/userProvider')
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");

// 내 동네 DB에 등록
exports.createUserLocation = async function (userIdx, villageIdx, rangeLevel) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction()
        // userIdx DB에 존재하는지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // villageIdx DB에 존재하는지 확인
        const checkVillageResult = await locationProvider.checkVillageIdx(villageIdx)
        if (checkVillageResult.length < 1) 
            return errResponse(baseResponse.VILLAGE_NOT_EXIST);

        // 등록된 userLocation이 2개 미만인지 확인
        const checkUserLocationsResult = await locationProvider.checkUserLocations(userIdx)
        if (checkUserLocationsResult.length > 1)
            return errResponse(baseResponse.USER_LOCATION_OVER_TWO);

        // 이미 등록된 villageIdx와 현재 등록하려는 villageIdx를 비교해서 같으면 이미 등록된 것이라는 에러 메시지
        if (checkUserLocationsResult.length > 0) {
            const existingLocationVillageIdx = checkUserLocationsResult[0].villageIdx
            if (villageIdx == existingLocationVillageIdx) {
                return errResponse(baseResponse.USER_LOCATION_REDUNDANT);
            }
        }

        // 이전에 등록된 userLocation이 1개 있다면 그 row의 isCurrent를 "NO"로 바꾼다
        if (checkUserLocationsResult.length > 0) {
            const existingUserLocationIdx = checkUserLocationsResult[0].idx
            await locationDao.updateIsCurrentNo(connection, existingUserLocationIdx)
        }

        // userLocation 등록
        const insertUserLocationParams = [userIdx, villageIdx, rangeLevel]
        const insertUserLocationResult = await locationDao.insertUserLocation(connection, insertUserLocationParams);
        console.log(`추가된 사용자 동네 : ${insertUserLocationResult[0].insertId}`)
        connection.commit()
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - createUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 내 동네 DB에서 삭제하기
exports.deleteUserLocation = async function (userIdx, userLocationIdx) {
    try {
        // userIdx DB에 존재하는지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // userLocationIdx DB에 존재하는지 확인
        const checkUserLocationIdxResult = await locationProvider.checkUserLocationIdx(userLocationIdx) 
        if (checkUserLocationIdxResult.length < 1)
            return errResponse(baseResponse.USER_LOCATION_NOT_EXIST);

        // userLocationIdx에 해당하는 userLocation의 주인이 userIdx와 일치하는지 확인
        if (checkUserLocationIdxResult[0].userIdx != userIdx)
          return errResponse(baseResponse.USER_LOCATION_NOT_MATCH);

        // 1개 이하면 삭제 불가 에러메시지

        // 2개면 남아있을 하나를 isCurrent = "YES" 변경하기

        // userLocation 삭제
        const connection = await pool.getConnection(async (conn) => conn);
        const updateUserLocationResult = await locationDao.updateUserLocation(connection, userLocationIdx);
        console.log(`삭제된 사용자 동네 : ${userLocationIdx}`)
        connection.release();
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - deleteUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};