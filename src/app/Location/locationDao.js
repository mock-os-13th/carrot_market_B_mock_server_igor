// dong 검색어로 검색
async function selectVillageLikeDong(connection, searchWord) {
    const selectVillageLikeDongQuery = `
            SELECT idx,
                    CONCAT(sido, " ", siGunGu, " ", dong) AS village
            FROM Village
            WHERE dong LIKE "%${searchWord}%"
        `;
    const [selectVillageLikeDongRow] = await connection.query(
        selectVillageLikeDongQuery,
        searchWord
    );
    return selectVillageLikeDongRow;
};

// siGunGu 검색어로 검색
async function selectVillageLikeSiGunGu(connection, searchWord) {
    const selectVillageLikeSiGunGuQuery = `
            SELECT idx,
                    CONCAT(sido, " ", siGunGu, " ", dong) AS village
            FROM Village
            WHERE siGunGu LIKE "%${searchWord}%"
                AND dong NOT LIKE "%${searchWord}%"
        `;
    const [selectVillageLikeSiGunGuRow] = await connection.query(
        selectVillageLikeSiGunGuQuery,
        searchWord
    );
    return selectVillageLikeSiGunGuRow;
};

// siDo 검색어로 검색
async function selectVillageLikeSido(connection, searchWord) {
    const selectVillageLikeSidoQuery = `
            SELECT idx,
                    CONCAT(sido, " ", siGunGu, " ", dong) AS village
            FROM Village
            WHERE siDo LIKE "%${searchWord}%"
                AND siGunGu NOT LIKE "%${searchWord}%"
                AND dong NOT LIKE "%${searchWord}%"
        `;
    const [selectVillageLikeSidoRow] = await connection.query(
        selectVillageLikeSidoQuery,
        searchWord
    );
    return selectVillageLikeSidoRow;
};

module.exports = {
    selectVillageLikeDong,
    selectVillageLikeSiGunGu,
    selectVillageLikeSido
};