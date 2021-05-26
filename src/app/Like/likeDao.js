// 휴대 전화로 회원 조회
async function selectItemLikeUserItem(connection, selectItemLikeUserItemParams) {
    const selectItemLikeUserItemQuery = `
                SELECT idx
                FROM LikeItem
                WHERE userIdx = ?
                    AND itemIdx = ?
                    AND status = "VALID";
                  `;
    const [itemLikeRow] = await connection.query(selectItemLikeUserItemQuery, selectItemLikeUserItemParams);
    return itemLikeRow;
};

async function insertItemLike(connection, itemLikeParams) {
    const insertItemLikeQuery = `
    INSERT INTO LikeItem(userIdx, itemIdx)
    VALUES (?, ?);
                  `;
    const itemLikeRow = await connection.query(insertItemLikeQuery, itemLikeParams);
    return itemLikeRow;
};

async function updateItemLike(connection, targetItemLikeIdx) {
    const updateItemLikeQuery = `
                UPDATE LikeItem
                SET status = "DELETED"
                WHERE idx = ?;
                  `;
    const itemLikeRow = await connection.query(updateItemLikeQuery, targetItemLikeIdx);
    return itemLikeRow;
};



module.exports = {
    selectItemLikeUserItem,
    insertItemLike,
    updateItemLike
  };
  