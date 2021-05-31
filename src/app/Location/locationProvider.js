const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const locationDao = require("./locationDao");
const userProvider = require('../User/userProvider')
const locationService = require("./locationService");
require("dotenv").config();

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