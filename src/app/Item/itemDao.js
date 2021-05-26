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
                SELECT idx
                FROM Item
                WHERE idx = ?
                  AND (status = "ONSALE"
                  OR status = "BOOKED");
                `;
  const [itemRow] = await connection.query(selectItemIdxQuery, itemIdx);
  return itemRow;
}

// idx로 item 상세정보 가져오기
async function selectItemdetails(connection, itemIdx) {
    const selectItemdetailsTitleQuery = `
        SELECT a.idx AS idx,
            a.userIdx AS sellerIdx,
            b.dong AS dong,
            c.mannerTemperature AS sellerMannerTemperature,
            a.title AS title,
            a.category AS category,
            a.status AS status,
            a.isOnTop AS isOnTop,
            CASE
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 1 THEN CONCAT(TIMESTAMPDIFF(second, a.onTopAt, NOW()), "초 전")
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(minute, a.onTopAt, NOW()), "분 전")
                WHEN TIMESTAMPDIFF(minute, a.onTopAt, NOW()) > 59 THEN CONCAT(TIMESTAMPDIFF(hour,  a.onTopAt, NOW()), "시간 전")
                WHEN DATEDIFF(NOW(), a.onTopAt) = 1 THEN "어제"
                WHEN DATEDIFF(NOW(), a.onTopAt) > 1 THEN CONCAT(DATEDIFF(a.onTopAt, NOW()), "일 전")
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

// 사진 등록 (수정필요)
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
    insertItemPictures
  };
  