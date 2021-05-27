// userIdx와 itemIdx로 관심 항목이 이미 있는지 조회
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

// userIdx로 관심 항목 조회
async function selectItemLikesUser(connection, userIdx) {
    const selectItemLikeUserItemQuery = `
                SELECT
                a.itemIdx AS idx,
                b.title,
                c.dong,
                b.isOnTop,
                CASE
                    WHEN TIMESTAMPDIFF(minute, b.onTopAt, NOW()) < 1 THEN CONCAT(TIMESTAMPDIFF(second, b.onTopAt, NOW()), "초 전")
                    WHEN TIMESTAMPDIFF(minute, b.onTopAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(minute, b.onTopAt, NOW()), "분 전")
                    WHEN TIMESTAMPDIFF(minute, b.onTopAt, NOW()) < 1440 THEN CONCAT(TIMESTAMPDIFF(hour,  b.onTopAt, NOW()), "시간 전")
                    WHEN TIMESTAMPDIFF(minute, b.onTopAt, NOW()) < 2880 THEN "어제"
                ELSE CONCAT(DATEDIFF(NOW(), b.onTopAt), "일 전")
                END AS passedTime,
                e.pictureUrl,
                b.status,
                "YES" AS isliked,
                b.price,
                IFNULL(d.numOfLikes, 0) AS numOfLikes,
                IFNULL(f.numOfChats, 0) AS numOfChats
                FROM LikeItem a
                INNER JOIN Item b ON a.itemIdx = b.idx
                INNER JOIN Village c ON b.villageIdx = c.idx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOflikes FROM LikeItem GROUP BY itemIdx) d ON a.itemIdx = d.itemIdx
                LEFT JOIN (SELECT itemIdx, pictureUrl FROM ItemPictures GROUP BY itemIdx) e ON a.itemIdx = e.itemIdx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOfChats FROM ChatRoom GROUP BY itemIdx) f ON a.itemIdx = f.itemIdx
                WHERE a.userIdx = ?
                    AND a.status = "VALID"
                  `;
    const [itemLikesRow] = await connection.query(selectItemLikeUserItemQuery, userIdx);
    return itemLikesRow;
};


// 관심상품 등록
async function insertItemLike(connection, itemLikeParams) {
    const insertItemLikeQuery = `
    INSERT INTO LikeItem(userIdx, itemIdx)
    VALUES (?, ?);
                  `;
    const itemLikeRow = await connection.query(insertItemLikeQuery, itemLikeParams);
    return itemLikeRow;
};

// 관심 상품 취소
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
    updateItemLike,
    selectItemLikesUser
  };
  