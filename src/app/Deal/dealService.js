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
        
        
        // 구매자 선택 목록 조회
        const buyerToBeList = await dealDao.selectChatRoomsItem(connection, itemIdx)

        // 리뷰 작성 여부 더미데이터 삽입
        for (buyer of buyerToBeList) {
            buyer.didReview = "NO"
        }

        if (buyerToBeList.length > 0) {
            buyerToBeList[0].didReview = "YES"
        }

        connection.commit()
        console.log(`추가된 거래완료 : ${insertDealResult[0].insertId}`)
        return response(baseResponse.SUCCESS, buyerToBeList)
    } catch (err) {
        connection.rollback()
        logger.error(`App - createDeal Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 구매자 등록
exports.insertBuyer = async function (userIdx, itemIdx, buyerIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

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

        // buyerIdx 의미적 검증
        const buyerStatusRows = await userProvider.checkUserStatus(buyerIdx);
        if (buyerStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // DB에 구매자 등록
        const updateBuyerParams = [buyerIdx, itemIdx]
        const updateBuyerResult = await dealDao.updateBuyer(connection, updateBuyerParams);
        
        connection.commit()
        console.log(`등록된 구매자 : ${buyerIdx}`)

        return response(baseResponse.SUCCESS)
    } catch (err) {
        connection.rollback()
        logger.error(`App - insertBuyer Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 거래 후기 등록
exports.createReview = async function (userIdx, itemIdx, reviewType, score, didCome, isKind, isTimely, didAnswerQuickly, message, pictureUrl) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // itemIdx 의미적 검증 (판매 처리가 안되어도 구매자가 리뷰를 작성이 가능한 것 같음)
            // 존재하는 상품인지만 확인
        const checkItemResult = await itemProvider.checkSoldItemIdx(itemIdx)
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);

        // 판매자 리뷰인 경우에는 
            // 상품에 등록된 판매자와 동일한지 확인하고
            // 사전에 판매완료 등록이 된 것인지 확인한다.
        if (reviewType === "SELLER") {
            const userIdxFromItemTable = checkItemResult[0].userIdx;
            if (userIdx != userIdxFromItemTable) return errResponse(baseResponse.USER_NOT_MATCH);
            const itemStatusFromItemTable = checkItemResult[0].status;
            if (itemStatusFromItemTable != "SOLDOUT") return errResponse(baseResponse.ITEM_NOT_SOLD_OUT);
        }

        // 이미 작성한 리뷰가 있으면 에러
        const checkReviewResult = await dealProvider.checkReview(userIdx, itemIdx)
        if (checkReviewResult.length > 0) return errResponse(baseResponse.REVIEW_REDUNDANT); 

        // DB에 거래 등록
        const insertReviewParams = [userIdx, itemIdx, reviewType, score, didCome, isKind, isTimely, didAnswerQuickly, message, pictureUrl]
        const insertReviewResult = await dealDao.insertReview(connection, insertReviewParams);

        connection.commit()
        console.log(`추가된 거래리뷰 : ${insertReviewResult[0].insertId}`)
        return response(baseResponse.SUCCESS)
    } catch (err) {
        connection.rollback()
        logger.error(`App - createReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};

// 판매 중으로 변경 (거래 취소)
exports.updateDeal = async function (userIdx, itemIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    
    try {
        await connection.beginTransaction()
        // userIdx 의미적 검증
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // itemIdx 의미적 검증
        const checkItemResult = await itemProvider.checkSoldItemIdx(itemIdx)
            // item 자체의 존재 여부
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);
            // userIdx가 Item에 등록된 것과 동일한지 확인
        const userIdxFromItemTable = checkItemResult[0].userIdx
        if (userIdx != userIdxFromItemTable)
           return errResponse(baseResponse.USER_NOT_MATCH); 
           // 이미 판매중이 아닌지 확인
        const statusFromItemTable = checkItemResult[0].status
        if (statusFromItemTable != "SOLDOUT")
            return errResponse(baseResponse.USER_NOT_MATCH);
        

        // DB에 거래 status "DELETED"로 만들기
        const updateDealStatusResult = await dealDao.updateDealStatus(connection, itemIdx);
        
        // Item에 Status "ONSALE"으로 수정
        const updateUnSoldItemResult = await itemDao.updateUnSoldItem(connection, itemIdx);

        connection.commit()
        return response(baseResponse.SUCCESS)
    } catch (err) {
        connection.rollback()
        logger.error(`App - updateDeal Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
};