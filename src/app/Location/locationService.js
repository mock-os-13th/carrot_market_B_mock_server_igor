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
exports.createUserLocation = async function (userIdx, villageIdx) {
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
        const insertUserLocationParams = [userIdx, villageIdx]
        const insertUserLocationResult = await locationDao.insertUserLocation(connection, insertUserLocationParams);
        console.log(`추가된 사용자 동네 : ${insertUserLocationResult[0].insertId}`)
        connection.commit()
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        connection.rollback()
        logger.error(`App - createUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 내 동네 DB에서 삭제하기
exports.deleteUserLocation = async function (userIdx, userLocationIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction()
        // userIdx DB에 존재하는지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // userLocationIdx DB에 존재하는지 확인
        const checkUserLocationIdxResult = await locationProvider.checkUserLocationIdx(userLocationIdx) 
        if (checkUserLocationIdxResult.length < 1)
            return errResponse(baseResponse.USER_LOCATION_NOT_EXIST);

        // 1개 이하면 삭제 불가 에러메시지
        const userLocationRows = await locationProvider.checkUserLocations(userIdx);
        if (userLocationRows.length < 2)
            return errResponse(baseResponse.USER_LOCATION_AT_LEAST_ONE);

        // userLocationIdx에 해당하는 userLocation의 주인이 userIdx와 일치하는지 확인
        if (checkUserLocationIdxResult[0].userIdx != userIdx)
          return errResponse(baseResponse.USER_LOCATION_NOT_MATCH);

        // 2개면 남아있을 하나를 isCurrent = "YES" 변경하기
        if (userLocationRows.length > 1) {
            for (userLocation of userLocationRows) {
                if (userLocation.idx != userLocationIdx) {
                    await locationDao.updateIsCurrentYes(connection, userLocation.idx) 
                }
            }
        }

        // userLocation 삭제
        const updateUserLocationResult = await locationDao.updateUserLocation(connection, userLocationIdx);
        console.log(`삭제된 사용자 동네 : ${userLocationIdx}`)
        connection.commit()
            // 블로그에 적기!
                // commit 빼먹으니까 반영이 안되고 성공만 뜸...
        return response(baseResponse.SUCCESS)

    } catch (err) {
        connection.rollback()
        logger.error(`App - deleteUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 현재 선택한 내 동네 바꾸기
exports.updateCurrentVillage = async function (userIdx, userLocationIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // userLocationIdx 의미적 검증
        const checkUserLocationIdxResult = await locationProvider.checkUserLocationIdx(userLocationIdx) 
        if (checkUserLocationIdxResult.length < 1)
            return errResponse(baseResponse.USER_LOCATION_NOT_EXIST);

        // userLocationIdx에 해당하는 userLocation의 주인이 userIdx와 일치하는지 확인
        if (checkUserLocationIdxResult[0].userIdx != userIdx)
            return errResponse(baseResponse.USER_LOCATION_NOT_MATCH);

        // 이미 isCurrent가 YES면 에러
        if (checkUserLocationIdxResult[0].isCurrent === "YES")
            return errResponse(baseResponse.USER_LOCATION_ALREADY_CURRENT);
        
        // 현재 동네가 2개면 기존의 1개는 isCurrent = "NO"로 표시
        const userLocationRows = await locationProvider.checkUserLocations(userIdx);
        if (userLocationRows.length > 1) {
            for (userLocation of userLocationRows) {
                if (userLocation.idx != userLocationIdx) {
                    await locationDao.updateIsCurrentNo(connection, userLocation.idx) 
                }
            }
        }

        // isCurrent = "YES"로 바꾸기
        const updateIsCurrentYesResult = await locationDao.updateIsCurrentYes(connection, userLocationIdx);
        console.log(`현재 동네로 설정된 동네 : ${userLocationIdx}`)
        connection.commit()
        return response(baseResponse.SUCCESS)

    } catch (err) {
        connection.rollback()
        logger.error(`App - updateCurrentVillage Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 인증 받은 위치 저장
exports.createAuthorizedUserLocation = async function (userIdx, villageIdx, userLocationDongByCoord) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction()
        
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);
    
        // villageIdx 의미적 검증
        const checkVillageResult = await locationProvider.checkVillageIdx(villageIdx)
        if (checkVillageResult.length < 1) 
            return errResponse(baseResponse.VILLAGE_NOT_EXIST);

        // userLocationDongByCoord과 villageIdx가 가리키는 dong이 동일한지 체크
        const dongByVillageIdx = checkVillageResult[0].dong
        if (dongByVillageIdx != userLocationDongByCoord)
            return errResponse(baseResponse.COORD_VILLAGE_IDX_NOT_MATCH);

        // userIdx로 현재 isCurrent인 userLocation 가져오기
        const currentUserLocation = await locationDao.selectCurrentUserLocation(connection, userIdx)
        console.log(currentUserLocation)
            // isCurrent인 위치 있으면 그 위치 삭제
        if (currentUserLocation.length > 0) {
            const currentUserLocationIdx = currentUserLocation[0].userLocationIdx
            await locationDao.updateUserLocation(connection, currentUserLocationIdx)
        }

        // 현재 위치 인증된 위치로 등록하기
        const insertAuthorizedUserLocationParms = [userIdx, villageIdx]
        const insertAuthorizedUserLocationResult = await locationDao.insertAuthorizedUserLocation(connection, insertAuthorizedUserLocationParms)
        console.log(`인증된 동네로 추가된 동네 : ${insertAuthorizedUserLocationResult[0].insertId}`)

        connection.commit()
        return response(baseResponse.SUCCESS)

    } catch (err) {
        connection.rollback()
        logger.error(`App - createAuthorizedUserLocation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// rangeLevel 변경하기
exports.changeRangeLevel = async function (userIdx, userLocationIdx, rangeLevel) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // userLocationIdx 의미적 검증
        const checkUserLocationIdxResult = await locationProvider.checkUserLocationIdx(userLocationIdx) 
        if (checkUserLocationIdxResult.length < 1)
            return errResponse(baseResponse.USER_LOCATION_NOT_EXIST);

        // userLocationIdx에 해당하는 userLocation의 주인이 userIdx와 일치하는지 확인
        if (checkUserLocationIdxResult[0].userIdx != userIdx)
            return errResponse(baseResponse.USER_LOCATION_NOT_MATCH);

        // rangeLevel 바꾸기
        const updateRangeLevelParams = [rangeLevel, userLocationIdx]
        const updateRangeLevelResult = await locationDao.updateRangeLevel(connection, updateRangeLevelParams);
        console.log(`rangeLevel 수정된 사용자 동네 : ${userLocationIdx}`)
        connection.commit()
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        connection.rollback()
        logger.error(`App - changeRangeLevel Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};