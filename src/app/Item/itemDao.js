// 유저 idx와 title로 item 유무 조회
async function selectItemUserTitle(connection, selectItemUserTitleParams) {
    const selectItemUserTitleQuery = `
                  SELECT idx
                  FROM Item
                  WHERE userIdx = ? 
                    AND title = ?
                    AND status = "ONSALE";
                  `;
    const [itemRows] = await connection.query(selectItemUserTitleQuery, selectItemUserTitleParams);
    return itemRows;
  }

// idx로 village 유무 조회
async function selectVillageIdx(connection, villageIdx) {
    const selectVillageIdxQuery = `
                  SELECT idx
                  FROM Village
                  WHERE idx = ?
                    AND status = "VALID";
                  `;
    const [villageRow] = await connection.query(selectVillageIdxQuery, villageIdx);
    return villageRow;
  }

// idx로 item 유무 조회
async function selectItemIdx(connection, itemIdx) {
  const selectItemIdxQuery = `
                SELECT idx, userIdx
                FROM Item
                WHERE idx = ?
                  AND status <> "DELETED";
                `;
  const [itemRow] = await connection.query(selectItemIdxQuery, itemIdx);
  return itemRow;
}

// idx로 item 조회 (status를 조회하기 위해서)
async function selectSoldItemIdx(connection, itemIdx) {
  const selectSoldItemIdxQuery = `
                SELECT idx, userIdx, status
                FROM Item
                WHERE idx = ?
                  AND status <> "DELETED";
                `;
  const [SoldItemRow] = await connection.query(selectSoldItemIdxQuery, itemIdx);
  return SoldItemRow;
}

// idx로 끌올시간 유닉스 타임스탬프로 변환해서 가져오기
async function selectOnTopAt(connection, lastItemIdx) {
  const selectOnTopAtQuery = `
            SELECT UNIX_TIMESTAMP(onTopAt) AS unixTimestamp
            FROM Item
            WHERE idx = ?
                `;
  const [onTopAtRow] = await connection.query(selectOnTopAtQuery, lastItemIdx);
  return onTopAtRow;
}

// idx로 item 상세정보 가져오기
async function selectItemdetails(connection, itemIdx) {
    const selectItemdetailsTitleQuery = `
        SELECT a.idx AS idx,
            a.userIdx AS sellerIdx,
            c.nickname AS sellerNickname,
            b.dong AS dong,
            c.mannerTemperature AS sellerMannerTemperature,
            a.title AS title,
            a.category AS category,
            a.status AS status,
            a.isOnTop AS isOnTop,
            CASE
              WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 1 THEN CONCAT(TIMESTAMPDIFF(second, a.onTopAt, NOW()), "초 전")
              WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(minute, a.onTopAt, NOW()), "분 전")
              WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 1440 THEN CONCAT(TIMESTAMPDIFF(hour,  a.onTopAt, NOW()), "시간 전")
              WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 2880 THEN "어제"
              ELSE CONCAT(DATEDIFF(NOW(), a.onTopAt), "일 전")
            END AS passedTime,
            a.content AS content,
            IFNULL(d.chatNum, 0) AS chatNum,
            IFNULL(e.likeNum, 0) AS likeNum,
            IFNULL(f. clickNum, 0) AS clickNum,
            a.price AS price,
            a.isNegotiable AS isNegotiable
        FROM Item a
        INNER JOIN Village b ON a.villageIdx = b.idx
        INNER JOIN User c ON a.userIdx = c.idx
        LEFT JOIN (SELECT itemidx, COUNT(itemIdx) AS chatNum FROM ChatRoom WHERE status = "VALID" GROUP BY itemidx ) d ON a.idx = d.itemIdx
        LEFT JOIN (SELECT itemidx, COUNT(itemIdx) AS likeNum FROM LikeItem WHERE status = "VALID" GROUP BY itemidx ) e ON a.idx = e.itemIdx
        LEFT JOIN (SELECT itemidx, COUNT(itemIdx) AS clickNum FROM Click WHERE status = "VALID" GROUP BY itemidx ) f ON a.idx = f.itemIdx
        WHERE a.idx = ?;
                  `;
    const [itemDetailRow] = await connection.query(selectItemdetailsTitleQuery, itemIdx);
    return itemDetailRow;
  }

// userIdx와 itemIdex로 itemLike가 있는지 확인
async function selectItemLike(connection, selectItemLikeParams) {
    const selectItemLikeQuery = `
                  SELECT idx
                  FROM LikeItem
                  WHERE userIdx = ? 
                    AND itemIdx = ?
                    AND status = "VALID";
                  `;
    const [itemLikeRows] = await connection.query(selectItemLikeQuery, selectItemLikeParams);
    return itemLikeRows;
  }

// itemIdx로 해당하는 사진 찾기
async function selectPicturesItemIdx(connection, itemIdx) {
    const selectPicturesItemIdxQuery = `
                  SELECT idx AS pictureIdx,
                    pictureUrl AS pictureUrl
                  FROM ItemPictures
                  WHERE itemIdx = ?
                    AND status = "VALID";
                  `;
    const [itemPictureRows] = await connection.query(selectPicturesItemIdxQuery, itemIdx);
    return itemPictureRows;
  }

// itemIdx로 해당하는 사진 중에 1가지만 가지고 오기
async function selectOnePictureItemIdx(connection, itemIdx) {
  const selectPicturesItemIdxQuery = `
                SELECT idx AS pictureIdx,
                  pictureUrl AS pictureUrl
                FROM ItemPictures
                WHERE itemIdx = ?
                  AND status = "VALID"
                LIMIT 1;
                `;
  const [itemPictureRows] = await connection.query(selectPicturesItemIdxQuery, itemIdx);
  return itemPictureRows;
}

// 판매자가 파는 물건 최근순 최대 4개
async function selectItemsBySeller(connection, sellerIdx) {
  const selectPicturesItemIdxQuery = `
          SELECT a.idx AS idx,
            a.title AS title,
            a.status AS status,
            a.price AS price
          FROM Item a
          WHERE a.userIdx = ?
          ORDER BY a.onTopAt DESC
          LIMIT 4
                `;
  const [sellerItemRows] = await connection.query(selectPicturesItemIdxQuery, sellerIdx);
  return sellerItemRows;
}

// 사용자 판매 상품 4개 가져오기
async function selectItemsBySeller(connection, sellerIdx) {
  const selectPicturesItemIdxQuery = `
          SELECT a.idx AS idx,
            a.title AS title,
            a.status AS status,
            a.price AS price
          FROM Item a
          WHERE a.userIdx = ?
          ORDER BY a.onTopAt DESC
          LIMIT 4
                `;
  const [sellerItemRows] = await connection.query(selectPicturesItemIdxQuery, sellerIdx);
  return sellerItemRows;
}

// 상품 목록 가져오기 (무한 스크롤)
async function selectItemsForList(connection, selectItemsForListParams) {
  const selectItemsForListQuery = `
            SELECT 
            a.idx,
            a.title,
            b.dong,
            a.isOnTop,
            CASE
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 1 THEN CONCAT(TIMESTAMPDIFF(second, a.onTopAt, NOW()), "초 전")
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(minute, a.onTopAt, NOW()), "분 전")
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 1440 THEN CONCAT(TIMESTAMPDIFF(hour,  a.onTopAt, NOW()), "시간 전")
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 2880 THEN "어제"
                ELSE CONCAT(DATEDIFF(NOW(), a.onTopAt), "일 전")
            END AS passedTime,
              a.status,
              a.price,
              c.pictureUrl,
              IFNULL(d.numOfLikes, 0) AS numOfLikes,
              IFNULL(e.numOfChats, 0) AS numOfChats
              FROM Item a
              INNER JOIN Village b ON a.villageIdx = b.idx
              LEFT JOIN (SELECT itemIdx, pictureUrl FROM ItemPictures GROUP BY itemIdx) c ON a.idx = c.itemIdx
              LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOfLikes FROM LikeItem GROUP BY itemIdx) d ON a.idx = d.itemIdx
              LEFT JOIN (SELECT itemIdx, COUNT(*) AS numOfChats FROM ChatRoom GROUP BY itemIdx) e ON a.idx = e.itemIdx
              WHERE category IN (${selectItemsForListParams[0]})
              AND CONCAT(LPAD(UNIX_TIMESTAMP(onTopAt), 15, 0), LPAD(a.idx, 15, 0)) < ${selectItemsForListParams[1]}
              ORDER BY a.onTopAt DESC, a.idx DESC
              LIMIT ${selectItemsForListParams[2]};
                `;
                // 백틱 안에 ${}로 넣은 이유는 기존의 ? 방식에는 따옴표까지 ?자리에 들어가 버리기 때문에
                // 나중에 블로그에 쓰기
  const [itemsRows] = await connection.query(selectItemsForListQuery);
  return itemsRows;
}


// item 등록
async function insertItem(connection, insertItemInfoParams) {
const insertItemInfoQuery = `
        INSERT INTO Item(userIdx, title, category, price, isNegotiable, content, villageIdx, rangeLevel)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
const insertUserInfoRow = await connection.query(
    insertItemInfoQuery,
    insertItemInfoParams
);

return insertUserInfoRow;
}

// click 등록
async function insertClick(connection, insertClick) {
  const insertClickQuery = `
          INSERT INTO Click(userIdx, itemIdx)
          VALUES (?, ?);
      `;
  const insertClickRow = await connection.query(
      insertClickQuery,
      insertClick
  );
  
  return insertClickRow;
  }

// 사진 등록
async function insertItemPictures(connection, insertItemPicturesParams) {
  const insertItemPicturesQuery = `
          INSERT INTO ItemPictures(itemIdx, pictureUrl, pictureId)
          VALUES (?, ?, ?);
      `;
  const insertItemPicturesRow = await connection.query(
    insertItemPicturesQuery,
    insertItemPicturesParams
  );
  
  return insertItemPicturesRow;
  }

// item 상태 SOLDOUT으로 변경
async function updateSoldItem(connection, itemIdx) {
  const updateSoldItemQuery = `
                                UPDATE Item
                                SET status = "SOLDOUT"
                                WHERE idx = ?;
                              `;
  const updateSoldItemRow = await connection.query(
    updateSoldItemQuery,
    itemIdx
  );

  return updateSoldItemRow;
}

// item 상태 ONSALE로 변경
async function updateUnSoldItem(connection, itemIdx) {
  const updateUnSoldItemQuery = `
                                UPDATE Item
                                SET status = "ONSALE"
                                WHERE idx = ?;
                              `;
  const updateUnSoldItemRow = await connection.query(
    updateUnSoldItemQuery,
    itemIdx
  );

  return updateUnSoldItemRow;
}


    
  
  module.exports = {
    selectItemUserTitle,
    insertItem,
    selectVillageIdx,
    selectItemdetails,
    selectItemLike,
    selectPicturesItemIdx,
    selectItemsBySeller,
    selectOnePictureItemIdx,
    selectItemIdx,
    insertClick,
    insertItemPictures,
    selectOnTopAt,
    selectItemsForList,
    updateSoldItem,
    selectSoldItemIdx,
    updateUnSoldItem
  };
  