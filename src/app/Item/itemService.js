const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const itemProvider = require("./itemProvider");
const itemDao = require("./itemDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

// 중고거래 물건 등록
exports.createItem = async function (userIdx, title, category, price, isNegotiable, content, villageIdx, rangeLevel) {
    try {
        // 자기가 쓴 글 제목이랑 동일한게 있는지 확인 (도배 방지)
        const itemRows = await itemProvider.checkSameItem(userIdx, title);
        if (itemRows.length > 0)
            return errResponse(baseResponse.ITEM_REDUNDANT);

        // 존재하는 동네인지 확인
        const villageRow = await itemProvider.checkVillageIdx(villageIdx);
        if (villageRow.length < 1)
            return errResponse(baseResponse.VILLAGE_NOT_EXIST);

        // DB에 글 등록
        const insertItemParams = [userIdx, title, category, price, isNegotiable, content, villageIdx, rangeLevel]
        const connection = await pool.getConnection(async (conn) => conn);
        const itemIdResult = await itemDao.insertItem(connection, insertItemParams);
        console.log(`추가된 중고거래 : ${itemIdResult[0].insertId}`)
        connection.release();
        
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - createItem Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};