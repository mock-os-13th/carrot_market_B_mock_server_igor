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
                                    LIMIT 10
                                        `;
    const [selectChatMessagesRow] = await connection.query(
        selectChatMessagesQuery,
        selectChatMessagesParams
    );
    return selectChatMessagesRow;
};

// userIdx로 채팅방 목록 찾기
    // 37. 채팅으로 거래하기 API (기본 lastChatMessageIdx를 사용함)
async function selectChatRoomsByUserIdx(connection, userIdx) {
    const selectChatRoomsByUserIdxQuery = `
                                SELECT
                                a.chatRoomIdx AS chatRoomIdx,
                                CASE
                                    WHEN a.buyerIdx = ${userIdx} THEN d.nickName
                                    ELSE c.nickName
                                    END AS nickName,
                                CASE
                                    WHEN a.buyerIdx = ${userIdx} THEN e.currentLocation
                                    ELSE f.currentLocation
                                END AS userLocation,
                                g.content AS recentMessage,
                                CASE
                                    WHEN TIMESTAMPDIFF(minute, g.createdAt, NOW()) < 1440 AND DATE_FORMAT(g.createdAt, "%p") = "AM" THEN DATE_FORMAT(g.createdAt, "오전 %h:%i")
                                    WHEN TIMESTAMPDIFF(minute, g.createdAt, NOW()) < 1440 AND DATE_FORMAT(g.createdAt, "%p") = "PM" THEN DATE_FORMAT(g.createdAt, "오후 %h:%i")
                                    WHEN TIMESTAMPDIFF(day, g.createdAt, NOW()) < 365 THEN DATE_FORMAT(g.createdAt, "%c월 %e일")
                                    ELSE DATE_FORMAT(g.createdAt, "%Y년 %c월 %e일") END AS recentMessageTime,
                                h.pictureUrl
                            FROM (SELECT
                                    ChatRoom.idx AS chatRoomIdx,
                                    ChatRoom.itemIdx,
                                    ChatRoom.buyerIdx,
                                    Item.userIdx AS sellerIdx,
                                    ChatRoom.status
                                FROM ChatRoom
                                INNER JOIN Item ON ChatRoom.itemIdx = Item.idx
                                WHERE Item.userIdx = ${userIdx} OR ChatRoom.buyerIdx = ${userIdx}) a
                            INNER JOIN Item b ON a.itemIdx = b.idx
                            INNER JOIN User c ON a.buyerIdx = c.idx
                            INNER JOIN User d ON a.sellerIdx = d.idx
                            LEFT JOIN (SELECT
                                            UserLocation.userIdx,
                                            CONCAT(Village.siDo, " ", Village.siGunGu) AS currentLocation
                                        FROM UserLocation
                                        INNER JOIN Village ON UserLocation.villageIdx = Village.idx
                                        WHERE UserLocation.status = "VALID"
                                            AND UserLocation.isCurrent = "YES") e ON a.buyerIdx = e.userIdx
                            LEFT JOIN (SELECT
                                            UserLocation.userIdx,
                                            CONCAT(Village.siDo, " ", Village.siGunGu) AS currentLocation
                                        FROM UserLocation
                                        INNER JOIN Village ON UserLocation.villageIdx = Village.idx
                                        WHERE UserLocation.status = "VALID"
                                            AND UserLocation.isCurrent = "YES") f ON a.sellerIdx = e.userIdx
                            LEFT JOIN (SELECT *
                                FROM ChatMessage
                                WHERE createdAt in (SELECT max(createdAt) FROM ChatMessage GROUP BY chatRoomIdx)
                                ) g ON a.chatRoomIdx = g.chatRoomIdx
                            LEFT JOIN (SELECT itemIdx, pictureUrl FROM ItemPictures GROUP BY itemIdx) h ON a.itemIdx = h.itemIdx;
                                        `;
    const [selectChatRoomsByUserIdxRow] = await connection.query(
        selectChatRoomsByUserIdxQuery,
        userIdx
    );
    return selectChatRoomsByUserIdxRow;
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
    insertChatMessage,
    selectChatRoomsByUserIdx
};