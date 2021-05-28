// 구매자 선택 목록 조회 API
async function selectChatRoomsItem(connection, itemIdx) {
    const selectChatRoomsItemQuery = `
                    SELECT a.idx,
                        a.profilePictureUrl,
                        a.nickName
                    FROM User a
                    INNER JOIN ChatRoom b ON a.idx = b.buyerIdx
                    WHERE b.itemIdx = ?
        `;
    const [selectChatRoomsItemRow] = await connection.query(
        selectChatRoomsItemQuery,
        itemIdx
    );
    return selectChatRoomsItemRow;
};

// 중복되는 리뷰 찾기 위한 쿼리
async function selectValidReview(connection, selectValidReviewParams) {
    const selectValidReviewQuery = `
                    SELECT idx
                    FROM Review
                    WHERE userIdx = ?
                        AND itemIdx = ?
                        AND status = "VALID"
        `;
    const [selectValidReviewRow] = await connection.query(
        selectValidReviewQuery,
        selectValidReviewParams
    );
    return selectValidReviewRow;
};

// 구매 등록
async function insertDeal(connection, itemIdx) {
    const insertDealQuery = `
            INSERT INTO Deal(itemIdx)
            VALUES (?);
        `;
    const insertDealRow = await connection.query(
        insertDealQuery,
        itemIdx
    );
    return insertDealRow;
};

// 구매자 등록
async function updateBuyer(connection, updateBuyerParams) {
    const updateBuyerQuery = `
                    UPDATE Deal
                    SET buyerIdx = ?
                    WHERE itemIdx = ?
                        AND status = "VALID";
                              `;
    const updateBuyerRow = await connection.query(
        updateBuyerQuery,
        updateBuyerParams
    );
    return updateBuyerRow;
};

// 리뷰 등록
async function insertReview(connection, insertReviewParams) {
    const insertReviewQuery = `
                            INSERT INTO Review(userIdx, itemIdx, reviewType, score, didCome, isKind, isTimely, didAnswerQuickly, message, pictureUrl)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                              `;
    const insertReviewRow = await connection.query(
        insertReviewQuery,
        insertReviewParams
    );
    return insertReviewRow;
};

// Deal status DELETED로 변경
async function updateDealStatus(connection, itemIdx) {
    const updateDealStatusQuery = `
                                  UPDATE Deal
                                  SET status = "DELETED"
                                  WHERE itemIdx = ?;
                                `;
    const updateDealStatusRow = await connection.query(
        updateDealStatusQuery,
        itemIdx
    );
    return updateDealStatusRow;
};

module.exports = {
    insertDeal,
    updateBuyer,
    selectChatRoomsItem,
    insertReview,
    selectValidReview,
    updateDealStatus
};