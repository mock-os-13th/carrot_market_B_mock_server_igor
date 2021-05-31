const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const itemProvider = require("./itemProvider");
const itemDao = require("./itemDao");
const userProvider = require('../User/userProvider')
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

// 중고거래 물건 등록
exports.createItem = async function (userIdx, title, category, price, isNegotiable, content, villageIdx, rangeLevel, pictures) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    try {
        await connection.beginTransaction()
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
        const itemIdResult = await itemDao.insertItem(connection, insertItemParams);
        
        const currentItemIdx = itemIdResult[0].insertId

        // insertId 사용해서 사진들 등록
        if (pictures.length > 0) {
            for (picture of pictures) {
                const insertItemPicturesPrams = [currentItemIdx, picture.pictureUrl, picture.pictureId];
                const insertItemPicturesResult = await itemDao.insertItemPictures(connection, insertItemPicturesPrams);
                console.log(`추가된 중고거래 사진 : ${insertItemPicturesResult[0].insertId}`)
            }
        }
        
        connection.commit()
        console.log(`추가된 중고거래 : ${itemIdResult[0].insertId}`)
        return response(baseResponse.SUCCESS)
    } catch (err) {
        connection.rollback()
        logger.error(`App - createItem Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 상세상품 조회하면 클릭 등록
exports.createClick = async function (userIdx, itemIdx) {
    try {
        // userIdx DB에 존재하는지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // itemIdx DB에 존재하는지 확인
        const checkItemResult = await itemProvider.checkItemIdx(itemIdx)
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);

        // 아이템 상세 정보 가져오기
        const retrieveItemResult = await itemProvider.retrieveItem(userIdx, itemIdx)

        // DB에 클릭 저장
        const insertClickParams = [userIdx, itemIdx]
        const connection = await pool.getConnection(async (conn) => conn);
        const clickResult = await itemDao.insertClick(connection, insertClickParams);
        console.log(`추가된 클릭 (조회) : ${clickResult[0].insertId}`)
        connection.release();
        
        return response(baseResponse.SUCCESS, retrieveItemResult)

    } catch (err) {
        logger.error(`App - createClick Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};