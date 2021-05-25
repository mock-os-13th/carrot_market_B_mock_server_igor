// 유저 idx와 title로 item 조회
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

// idx로 village 조회
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


    
  
  module.exports = {
    selectItemUserTitle,
    insertItem,
    selectVillageIdx
  };
  