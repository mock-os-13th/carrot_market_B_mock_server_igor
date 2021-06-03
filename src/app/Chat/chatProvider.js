const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const chatProvider = require("./chatProvider")
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

// 채팅방에 대한 정보 불러오기
  // 채팅방 형식적 검증에 사용
exports.checkChatRoom = async function (chatRoomIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectChatRoomResult = await chatDao.selectChatRoom(connection, chatRoomIdx)
    connection.release();
    return selectChatRoomResult
  };

  // 입력된 채팅방 번호와 userIdx로 didWhoSaid를 결정함
  exports.decideDidWhoSaid = async function (userIdx, chatRoomIdx) {
    // chatRoom 의미적 검증
    const chatRoomRows = await chatProvider.checkChatRoom(chatRoomIdx);
    if (chatRoomRows.length < 1)
        return errResponse(baseResponse.CHATROOM_NOT_EXIST);

    // 채팅방에 있는 buyerIdx와 비교하기
    const buyerIdxFromChatRoom = chatRoomRows[0].buyerIdx
    // userIdx = buyerId라면
    if (buyerIdxFromChatRoom == userIdx) {
        return "BUYER"
    } else {            
        return "SELLER"
    }
  };


