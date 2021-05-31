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
        const checkItemResult = await itemProvider.checkItemIdx(itemIdx)
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);

        // 등록된 userLocation이 2개 미만인지 확인

        // 좋아요 있는지 확인
        const checkItemLikeResult = await likeProvider.checkItemLike(userIdx, itemIdx) 

        const connection = await pool.getConnection(async (conn) => conn);
        // 좋아요 있으면 취소하고 없으면 신규 등록
        if (checkItemLikeResult.length < 1) { // 신규 등록
            const itemLikeParams = [userIdx, itemIdx]
            const insertItemLikeResult = await likeDao.insertItemLike(connection, itemLikeParams)
            console.log(`추가된 관심상품 : ${insertItemLikeResult[0].insertId}`)
        } else {
            const targetItemLikeIdx = checkItemLikeResult[0].idx
            const updateItemLikeResult = await likeDao.updateItemLike(connection, targetItemLikeIdx)
            console.log(`취소된 관심상품의 Idx : ${targetItemLikeIdx}`)
                // (블로그 기록) : 속을 알 수 없는 object Object를 출력하기 위해서 쓴다
                    // 잘 되지는 않는다...
        }
        connection.release();
               
        return response(baseResponse.SUCCESS)

    } catch (err) {
        logger.error(`App - createOrDeleteItemLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
