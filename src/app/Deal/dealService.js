const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const dealProvider = require("./dealProvider");
const dealDao = require("./dealDao");
const userProvider = require('../User/userProvider')
const itemProvider = require('../Item/itemProvider')
const itemDao = require('../Item/itemDao')
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");

// 거래 등록
exports.createDeal = async function (userIdx, itemIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // itemIdx 의미적 검증 (DELETED가 아닌 것이어야 함)
        const checkItemResult = await itemProvider.checkItemIdx(itemIdx)
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);

        // userIdx가 Item에 등록된 것과 동일한지 확인
        const userIdxFromItemTable = checkItemResult[0].userIdx
        if (userIdx != userIdxFromItemTable)
           return errResponse(baseResponse.USER_NOT_MATCH); 

        // DB에 거래 등록
        const insertDealResult = await dealDao.insertDeal(connection, itemIdx);
        
        // Item에 Status "SOLDOUT"으로 수정
        const itemIdResult = await itemDao.updateSoldItem(connection, itemIdx);
        connection.commit()
        
        console.log(`추가된 거래완료 : ${insertDealResult[0].insertId}`)
        const createdDealIdx = { "dealIdx": insertDealResult[0].insertId }
        return response(baseResponse.SUCCESS, createdDealIdx)
    } catch (err) {
        connection.rollback()
        logger.error(`App - createDeal Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};