const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const locationDao = require("./locationDao");
const userProvider = require('../User/userProvider')
require("dotenv").config();

// villageIdx 의미적 검증
exports.checkVillageIdx = async function (villageIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectVillageIdxResult = await locationDao.selectVillageIdx(connection, villageIdx);
    connection.release();

    return selectVillageIdxResult
  };

// userLocation 2개 갯수 확인용
exports.checkUserLocations = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectUserLocationsResult = await locationDao.selectUserLocations(connection, userIdx);
    connection.release();

    return selectUserLocationsResult
  };

// userLocationIdx의 의미적 검증 + userLocation의 userIdx와 입력된 userIdx 비교
exports.checkUserLocationIdx = async function (userLocationIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectUserIdxResult = await locationDao.selectUserIdxByIdx(connection, userLocationIdx);
    connection.release();

    return selectUserIdxResult
  };


// 검색어로 동네 DB에서 검색
exports.retrieveLocationSearchList = async function (searchWord) {
    // 리스트 가져오기
    const connection = await pool.getConnection(async (conn) => conn);
    const selectVillageLikeDongResult = await locationDao.selectVillageLikeDong(connection, searchWord);
    const selectVillageLikeSiGunGuResult = await locationDao.selectVillageLikeSiGunGu(connection, searchWord);
    const selectVillageLikeSidoResult = await locationDao.selectVillageLikeSido(connection, searchWord);
    connection.release();

    const searchResult = [
        ...selectVillageLikeDongResult, 
        ...selectVillageLikeSiGunGuResult,
        ...selectVillageLikeSidoResult
    ]

    return response(baseResponse.SUCCESS, searchResult)
  };

// 내 동네 최대 2곳 가져오기
exports.retrieveMyVillages = async function (userIdx) {
    // userIdx 의미적 검증
    const userStatusRows = await userProvider.checkUserStatus(userIdx);
    if (userStatusRows.length < 1)
        return errResponse(baseResponse.USER_NOT_EXIST);
   
    const connection = await pool.getConnection(async (conn) => conn);

     // userIdx에 등록된 userLocationIdx, villageIdx 가져오기
    let selectUserLocationResult = await locationDao.selectUserLocations(connection, userIdx);

    // userLocation에 등록된 villageIdx로 주변 동네 갯수 가져오기
        // 예외처리 -> 만약에 등록된 위치 없으면 빈 배열 리턴
    if (selectUserLocationResult.length < 1) return response(baseResponse.SUCCESS, selectUserLocationResult)

    if (selectUserLocationResult.length > 2) return errResponse(baseResponse.USER_NOT_EXIST);

    for (userLocation of selectUserLocationResult) { // userLocation 하나 마다 범위별 근처 동네 정보 담기
        const userLocationVillageIdx = userLocation.villageIdx
        const selectNumOfNearVillagesResult = await locationDao.selectNumOfNearVillages(connection, userLocationVillageIdx);
        for (villageRange of selectNumOfNearVillagesResult) {
            const rangeLevel = villageRange.rangeLevel // userLocation 하나의 범위 하나 마다 주변 동네 갯수 담기
            const villageDongsByRangeLevel = await locationDao.selectDongByFromIdxRangeLevel(connection, userLocationVillageIdx, rangeLevel);
            let dongArray = []
            for (nearVillage of villageDongsByRangeLevel) {
                dongArray.push(nearVillage.dong)
            }
            villageRange.dongs = dongArray
        }
        userLocation.nearVillages = selectNumOfNearVillagesResult
    }

    connection.release();

    return response(baseResponse.SUCCESS, selectUserLocationResult)
  };