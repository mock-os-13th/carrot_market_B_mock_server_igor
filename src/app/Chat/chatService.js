const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const chatProvider = require("./chatProvider");
const chatDao = require("./chatDao");
const userProvider = require('../User/userProvider')
const itemProvider = require('../Item/itemProvider')
const itemDao = require('../Item/itemDao')
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const {connect} = require("http2");


// 채팅방 만들기
    // 38. 채팅 보내기 API
exports.createChatRoom = async function (userIdx, itemIdx) {
        // userIdx DB에 존재하는지 확인
        const userStatusRows = await userProvider.checkUserStatus(userIdx);
        if (userStatusRows.length < 1)
            return errResponse(baseResponse.USER_NOT_EXIST);

        // itemIdx DB에 존재하는지 확인
        const checkItemResult = await itemProvider.checkItemIdx(itemIdx)
        if (checkItemResult.length < 1) 
            return errResponse(baseResponse.ITEM_NOT_EXIST);

        // 이미 존재하는 채팅방이 있는지 확인
        const existingChatRoomRows = await chatProvider.findChatRoom(userIdx, itemIdx)
        if (existingChatRoomRows.length > 0)
            return false

        // 채팅방 만들기
        const connection = await pool.getConnection(async (conn) => conn);
        const insertChatRoomPrams = [userIdx, itemIdx]
        const insertChatRoomResult = await chatDao.insertChatRoom(connection, insertChatRoomPrams)         
        connection.release();
        console.log(`추가된 채팅방 : ${insertChatRoomResult[0].insertId}`)

        const createdChatRoomIdx = insertChatRoomResult[0].insertId

        return createdChatRoomIdx
};

// 채팅 메시지 만들기
    // 38. 채팅 보내기 API
exports.createChatMessage = async function (message, chatRoomIdx, didWhoSaid, userIdx) {
    // chatRoom 의미적 검증
    const chatRoomRows = await chatProvider.checkChatRoom(chatRoomIdx);
    if (chatRoomRows.length < 1)
        return errResponse(baseResponse.CHATROOM_NOT_EXIST);

    // 만약에 SELLER라면 item의 주인인지 검증할 것
    if (didWhoSaid == "SELLER") {
        const itemIdxFromChatRoom = chatRoomRows[0].itemIdx
        const itemInfoFromItemIdx = await itemProvider.checkItemIdx(itemIdxFromChatRoom)
        const sellerIdxFromItemIdx = itemInfoFromItemIdx[0].userIdx
        if (sellerIdxFromItemIdx != userIdx)
            return errResponse(baseResponse.CHATROOM_NOT_SELLER_NOT_MATCH); 
    }

    // 채팅메시지 만들기
    const connection = await pool.getConnection(async (conn) => conn);
    const insertChatRoomPrams = [chatRoomIdx, didWhoSaid, message]
    const insertChatRoomResult = await chatDao.insertChatMessage(connection, insertChatRoomPrams)         
    connection.release();
    console.log(`추가된 채팅메시지 : ${insertChatRoomResult[0].insertId}`)
    const chatRoomIdxResult = { "chatRoomIdx": chatRoomIdx }
    return response(baseResponse.SUCCESS, chatRoomIdxResult)
};
