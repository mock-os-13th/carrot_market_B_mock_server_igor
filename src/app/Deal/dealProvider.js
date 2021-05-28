const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const dealDao = require("./dealDao");
const itemProvider = require("../Item/itemProvider")
const userProvider = require('../User/userProvider')

const jwt = require("jsonwebtoken");

exports.retrieveBuyerToBeList = async function (userIdx, itemIdx) {
    // itemIdx 의미적 검증 (SOLDOUT인지 확인해야 함)
    const checkSoldItemResult = await itemProvider.checkSoldItemIdx(itemIdx)
        // item이 존재하는지 여부
    if (checkSoldItemResult.length < 1) 
        return errResponse(baseResponse.ITEM_NOT_EXIST); 
        // 판매 완료된 상품인지
    if (checkSoldItemResult[0].status != "SOLDOUT")
        return errResponse(baseResponse.ITEM_NOT_SOLD_OUT);
        // userIdx가 Item에 등록된 것과 동일한지 확인
    const userIdxFromItemTable = checkSoldItemResult[0].userIdx
    if (userIdx != userIdxFromItemTable)
        return errResponse(baseResponse.USER_NOT_MATCH);  
    
    
    // 구매자 선택 목록 조회
    const connection = await pool.getConnection(async (conn) => conn);
    const buyerToBeList = await dealDao.selectChatRoomsItem(connection, itemIdx)
    connection.release();

    // 리뷰 작성 여부 더미데이터 삽입
    for (buyer of buyerToBeList) {
        buyer.didReview = "NO"
    }

    if (buyerToBeList.length > 0) {
        buyerToBeList[0].didReview = "YES"
    }

    return response(baseResponse.SUCCESS, buyerToBeList)
  };