// 채팅방 UI에 표시할 정보들 가져오기
    // 37. 채팅으로 거래하기 API
async function selectChatRoomInfo(connection, itemIdx) {
    const selectChatRoomInfoQuery = `
                            SELECT
                                a.userIdx AS sellerIdx,
                                b.nickName,
                                b.profilePictureUrl,
                                b.mannerTemperature,
                                "10시간" AS responseTime,
                                a.idx AS itemIdx,
                                a.status,
                                a.title,
                                a.price
                            FROM Item a
                            INNER JOIN User b ON a.userIdx = b.idx
                            WHERE a.idx = ?
        `;
    const [selectChatRoomInfoRow] = await connection.query(
        selectChatRoomInfoQuery,
        itemIdx
    );
    return selectChatRoomInfoRow;
};

// 채팅방 idx로 VALID한 채팅방 정보 가져오기
async function selectChatRoom(connection, chatRoomIdx) {
    const sselectChatRoomQuery = `
                        SELECT idx, buyerIdx, itemIdx
                        FROM ChatRoom
                        WHERE idx = ?
                            AND status = "VALID";
                                        `;
    const [selectChatRoomRow] = await connection.query(
        sselectChatRoomQuery,
        chatRoomIdx
    );
    return selectChatRoomRow;
};

// 채팅방 번호 가져오기
    // 37. 채팅으로 거래하기 API
async function selectChatRoomByUserItem(connection, selectChatRoomByUserItemParms) {
    const selectChatRoomByUserItemQuery = `
                    SELECT
                        idx AS chatRoomIdx,
                        buyerIdx
                    FROM ChatRoom
                    WHERE buyerIdx = ?
                        AND itemIdx = ?;
                                        `;
    const [selectChatRoomByUserItemRow] = await connection.query(
        selectChatRoomByUserItemQuery,
        selectChatRoomByUserItemParms
    );
    return selectChatRoomByUserItemRow;
};

// 특정 채팅방에서 과거 대화 불러오기 (무한 스크롤)
    // 37. 채팅으로 거래하기 API (기본 lastChatMessageIdx를 사용함)
async function selectChatMessages(connection, selectChatMessagesParams) {
    const selectChatMessagesQuery = `
                                    SELECT
                                        didWhoSaid,
                                        content,
                                        DATE_FORMAT(createdAt, "%Y년 %c월 %e일") AS chatDate,
                                        CASE
                                            WHEN DATE_FORMAT(createdAt, "%p") = "AM" THEN DATE_FORMAT(createdAt, "오전 %h:%i")
                                            WHEN DATE_FORMAT(createdAt, "%p") = "PM" THEN DATE_FORMAT(createdAt, "오후 %h:%i")
                                        END AS chatTime
                                    FROM ChatMessage
                                    WHERE chatRoomIdx = ?
                                        AND idx < ?
                                    ORDER BY createdAt ASC
                                    LIMIT 5
                                        `;
    const [selectChatMessagesRow] = await connection.query(
        selectChatMessagesQuery,
        selectChatMessagesParams
    );
    return selectChatMessagesRow;
};

// 새로운 채팅방 만들기
    // 38. 채팅 보내기 API
    async function insertChatRoom(connection, selectChatRoomByUserItemParms) {
        const insertChatRoomQuery = `
                            INSERT INTO ChatRoom(buyerIdx, itemIdx)
                            VALUES (?, ?);
                                            `;
        const insertChatRoomRow = await connection.query(
            insertChatRoomQuery,
            selectChatRoomByUserItemParms
        );
        return insertChatRoomRow;
    };

// 새로운 채팅메시지 만들기
    // 37. 채팅 보내기 API
async function insertChatMessage(connection, insertChatRoomPrams) {
    const insertChatMessageQuery = `
                        INSERT INTO ChatMessage(chatRoomIdx, didWhoSaid, content)
                        VALUES (?, ?, ?);
                                        `;
    const insertChatMessageRow = await connection.query(
        insertChatMessageQuery,
        insertChatRoomPrams
    );
    return insertChatMessageRow;
};
    

module.exports = {
    selectChatRoomInfo,
    selectChatRoomByUserItem,
    selectChatMessages,
    insertChatRoom,
    selectChatRoom,
    insertChatMessage
};