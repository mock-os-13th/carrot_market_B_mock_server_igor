const chatProvider = require("../../app/Chat/chatProvider");
const chatService = require("../../app/Chat/chatService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");
const {emit} = require("nodemon");


/**
 * API No. 37
 * API Name : 채팅으로 거래하기 API
 * [POST] /app/chats/rooms-by-item
 */
 exports.getRoomByItem = async function (req, res) {

    /**
     * query string: itemIdx
     * header: jwt token
     */

    const itemIdx = req.query.itemIdx
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // 채팅방 UI에 표시할 정보들 가져오기
    const chatRoomInfo = await chatProvider.retrieveChatRoomInfo(itemIdx);

    // 채팅방 조회해서 가져오기
    const findChatRoomResult = await chatProvider.findChatRoom(userIdx, itemIdx);

    // 채팅방 있으면 과거 대화 불러오고 없으면 채팅방 만든다.
    if (findChatRoomResult.length > 1) {
        var chatRoomIdx = findChatRoomResult[0].chatRoomIdx;
        const lastChatMessageIdx = 999999999999999
        var recentDialogues = await chatProvider.retrieveDialogues(chatRoomIdx, lastChatMessageIdx); // 함수
    } else {
        var chatRoomIdx = null
        var recentDialogues = [];
    }

    // 정보 JSON으로 바꾸기
    let getRoomByItemResult = new Object()
    getRoomByItemResult.chatRoomInfo = chatRoomInfo
    getRoomByItemResult.chatRoomIdx = chatRoomIdx
    getRoomByItemResult.recentDialogues = recentDialogues

    return res.send(response(baseResponse.SUCCESS, getRoomByItemResult));
};