// click 등록
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

module.exports = {
    insertDeal
    };