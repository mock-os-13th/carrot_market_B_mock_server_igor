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

// 관심 상품 등록 / 취소
exports.createUserLocation = async function (userIdx, villageIdx, rangeLevel) {
    try {
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

        // userLocation 등록
        const insertUserLocationParams = [userIdx, villageIdx, rangeLevel]
        const connection = await pool.getConnection(async (conn) => conn);
        const insertUserLocationResult = await locationDao.insertUserLocation(connection, insertUserLocationParams);
        console.log(`추가된 사용자 동네 : ${insertUserLocationResult[0].insertId}`)
        connection.release();
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - createUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
