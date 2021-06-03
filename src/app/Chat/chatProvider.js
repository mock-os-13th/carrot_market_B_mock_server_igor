const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const chatDao = require("./chatDao");
const itemProvider = require("../Item/itemProvider")
const userProvider = require('../User/userProvider')

// 채팅방 UI에 표시할 정보들 가져오기 
    // 37. 채팅으로 거래하기 API
exports.retrieveChatRoomInfo = async function (itemIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectChatRoomInfoResult = await chatDao.selectChatRoomInfo(connection, itemIdx)
    connection.release();
    return selectChatRoomInfoResult
  };

// 채팅방 번호 가져오기
    // 37. 채팅으로 거래하기 API
exports.findChatRoom = async function (userIdx, itemIdx) {
    const selectChatRoomByUserItemParms = [userIdx, itemIdx]
    const connection = await pool.getConnection(async (conn) => conn);
    const selectChatRoomByUserItemResult = await chatDao.selectChatRoomByUserItem(connection, selectChatRoomByUserItemParms)
    connection.release();
    return selectChatRoomByUserItemResult
  };

// 특정 채팅방에서 과거 대화 불러오기 (무한 스크롤)
    // 37. 채팅으로 거래하기 API (기본 lastChatMessageIdx를 사용함)
exports.retrieveDialogues = async function (chatRoomIdx, lastChatMessageIdx) {
    selectChatMessagesParams = [chatRoomIdx, lastChatMessageIdx]
    const connection = await pool.getConnection(async (conn) => conn);
    const selectChatMessagesResult = await chatDao.selectChatMessages(connection, selectChatMessagesParams)
    connection.release();
    return selectChatMessagesResult
  };