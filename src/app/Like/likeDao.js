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

// userIdx와 sellerIdx로 모아보기가 이미 있는지 조회
async function selectSellerLikeUserItem(connection, selectSellerLikeUserParams) {
    const selectSellerLikeUserItemQuery = `
                SELECT idx
                FROM LikeSeller
                WHERE userIdx = ?
                    AND sellerIdx = ?
                    AND status = "VALID";
                  `;
    const [sellerLikeRow] = await connection.query(selectSellerLikeUserItemQuery, selectSellerLikeUserParams);
    return sellerLikeRow;
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

// userIdx로 관심 항목 조회
async function selectSellerLikeItemsUser(connection, userIdx) {
    const selectSellerLikeItemsUserQuery = `
                                SELECT a.idx,
                                    a.title,
                                    c.nickName,
                                    d.siGunGu,
                                    d.dong,
                                    e.pictureUrl,
                                    a.status,
                                    a.price,
                                    IFNULL(f.numOfLikes, 0) AS numOfLikes,
                                    IFNULL(g.numOfChats, 0) AS numOfChats
                                FROM Item a
                                INNER JOIN (SELECT * FROM LikeSeller WHERE userIdx = 1 AND status = "VALID") b ON a.userIdx = b.sellerIdx
                                INNER JOIN User c ON b.sellerIdx = c.idx
                                INNER JOIN Village d ON a.villageIdx = d.idx
                                LEFT JOIN (SELECT * FROM ItemPictures GROUP BY itemIdx) e ON a.idx = e.itemIdx
                                LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOfLikes FROM LikeItem WHERE status = "VALID" GROUP BY itemIdx) f ON a.idx = f.itemIdx
                                LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOfChats FROM ChatRoom WHERE status = "VALID" GROUP BY itemIdx) g ON a.idx = g.itemIdx
                                ORDER BY a.createdAt DESC;
                  `;
    const [sellerLikeItemsRow] = await connection.query(selectSellerLikeItemsUserQuery, userIdx);
    return sellerLikeItemsRow;
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

// 판매자 모아보기 등록
async function insertSellerLike(connection, insertSellerLikeParams) {
    const insertSellerLikeQuery = `
    INSERT INTO LikeSeller(userIdx, sellerIdx)
    VALUES (?, ?);
                  `;
    const sellerLikeRow = await connection.query(insertSellerLikeQuery, insertSellerLikeParams);
    return sellerLikeRow;
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

// 판매자 모아보기 취소
async function updateSellerLike(connection, targetSellerLikeIdx) {
    const updateSellerLikeQuery = `
                UPDATE LikeSeller
                SET status = "DELETED"
                WHERE idx = ?;
                  `;
    const sellerLikeRow = await connection.query(updateSellerLikeQuery, targetSellerLikeIdx);
    return sellerLikeRow;
};



module.exports = {
    selectItemLikeUserItem,
    insertItemLike,
    updateItemLike,
    selectItemLikesUser,
    selectSellerLikeUserItem,
    insertSellerLike,
    updateSellerLike,
    selectSellerLikeItemsUser
  };
  