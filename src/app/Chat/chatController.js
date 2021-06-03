const chatProvider = require("../../app/Chat/chatProvider");
const chatService = require("../../app/Chat/chatService");
const itemProvider = require("../Item/itemProvider")
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");
const {emit} = require("nodemon");


/**
 * API No. 37
 * API Name : 채팅방 열기 API
 * [GET] /app/chats/messages
 */
 exports.getMessages = async function (req, res) {

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

    let chatRoomIdx = null
    let recentDialogues = []
        // 처음에는 그냥 if 절안에 var로 선언했는데 보니까 그렇게 하면 완전 전역 변수가 되어서
        // exports 밖까지 영향을 미친다. 조심!!!

    // 채팅방 있으면 과거 대화 불러오고 없으면 기본 값 반환
    if (findChatRoomResult.length > 0) {
        chatRoomIdx = findChatRoomResult[0].chatRoomIdx;
        const lastChatMessageIdx = 999999999999999
        recentDialogues = await chatProvider.retrieveDialogues(chatRoomIdx, lastChatMessageIdx); // 함수
    } 

    // 정보 JSON으로 바꾸기
    let getRoomByItemResult = new Object()
    getRoomByItemResult.chatRoomInfo = chatRoomInfo
    getRoomByItemResult.chatRoomIdx = chatRoomIdx
    getRoomByItemResult.recentDialogues = recentDialogues

    return res.send(response(baseResponse.SUCCESS, getRoomByItemResult));
};


/**
 * API No. 38
 * API Name : 채팅 보내기 API
 * [POST] /app/chats/message
 */
 exports.postMessage = async function (req, res) {

    /**
     * body: itemIdx(or chatRoomIdx), message
     * header: jwt token
     */

    const itemIdx = req.body.itemIdx;
    const chatRoomIdx = req.body.chatRoomIdx;
    const message = req.body.message;
    const userIdx = req.verifiedToken.userIdx;

    // 양자 택일 입력값 점검
        // 둘 다 오지 않은 경우
    if ((!itemIdx)&&(!chatRoomIdx)) return res.send(errResponse(baseResponse.CHAT_NOT_CHATROOM_AND_ITEM));
        // 둘 다 온 경우
    if ((itemIdx)&&(chatRoomIdx)) return res.send(errResponse(baseResponse.CHAT_BOTH_CHATROOM_AND_ITEM));

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // message 형식적 검증
    const messageVerification = inputverifier.verifyMessage(message);
    if (!messageVerification.isValid) return res.send(errResponse(messageVerification.errorMessage));

    // 송신자 설정
    let didWhoSaid = ""

    // itemIdx로 메시지를 보내는 경우 (첫 메시지를 보내는 구매자)
    if ((itemIdx)&&(!chatRoomIdx)) {
    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // 채팅방 만들기
    const createChatRoomResult = await chatService.createChatRoom(userIdx, itemIdx)
        // 만들어진 채팅방 유효성 검증
    if (!(createChatRoomResult.newChatRoomIdx)) return res.send(errResponse(createChatRoomResult.errorMessage));

    // 그 채팅방으로 문자 보내기
    didWhoSaid = "BUYER"
    const newChatRoomIdx = createChatRoomResult.newChatRoomIdx
    const createChatMessageResponse = await chatService.createChatMessage(message, newChatRoomIdx, didWhoSaid, userIdx)

    return res.send(createChatMessageResponse); 

    // chatRoomIdx로 메시지를 보내는 경우 (판매자 혹은 2번째 이상의 메시지를 보내는 구매자)
    } else {
        // chatRoomIdx 형식적 검증
        const chatRoomIdxVerification = inputverifier.verifyChatRoomIdx(chatRoomIdx);
        if (!chatRoomIdxVerification.isValid) return res.send(errResponse(chatRoomIdxVerification.errorMessage)); 

        // BUYER인지 SELLER인지 구분하기
        didWhoSaid = await chatProvider.decideDidWhoSaid(userIdx, chatRoomIdx)
        
        // 채팅방에 문자 보내기
        const createChatMessageResponse = await chatService.createChatMessage(message, chatRoomIdx, didWhoSaid, userIdx)

        return res.send(createChatMessageResponse); 
    }
};

/**
 * API No. 39
 * API Name : 채팅목록 보기 API
 * [GET] /app/chats/rooms
 */
 exports.getRoomList = async function (req, res) {

    /**
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // 채팅방 목록 가져오기
    const retrieveChatRoomListResponse = await chatProvider.retrieveChatRoomList(userIdx);

    return res.send(retrieveChatRoomListResponse)
};