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
                        AND status = "VALID;
                              `;
    const updateBuyerRow = await connection.query(
        updateBuyerQuery,
        updateBuyerParams
    );
    return updateBuyerRow;
};

module.exports = {
    insertDeal,
    updateBuyer,
    selectChatRoomsItem
    };