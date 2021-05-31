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

// userLocation에 있는 villageIdx 가져오기
async function selectUserLocations(connection, userIdx) {
    const selectUserLocationsQuery = `
                    SELECT a.idx,
                        a.villageIdx,
                        b.dong
                    FROM UserLocation a
                    INNER JOIN Village b ON a.villageIdx = b.idx
                    WHERE a.userIdx = ?
                    AND a.status = "VALID";
        `;
    const [selectUserLocationsRow] = await connection.query(
        selectUserLocationsQuery,
        userIdx
    );
    return selectUserLocationsRow;
};

// villageIdx로 단계별 주변 village 갯수 가져오기
async function selectNumOfNearVillages(connection, userLocationVillageIdx) {
    const selectNumOfNearVillagesQuery = `
                SELECT
                    rangeLevel,
                    COUNT(*) AS numOfNearVillages
                FROM VillageRelation
                WHERE fromVillageIdx = ?
                GROUP BY rangeLevel
                ORDER BY rangeLevel;
        `;
    const [selectNumOfNearVillagesRow] = await connection.query(
        selectNumOfNearVillagesQuery,
        userLocationVillageIdx
    );
    return selectNumOfNearVillagesRow;
};

// fromVillageIdx와 rangeLevel로 주변 villageDong 이름 가져오기
async function selectDongByFromIdxRangeLevel(connection, userLocationVillageIdx, rangeLevel) {
    const selectDongByFromIdxRangeLevelQuery = `
                    SELECT b.dong
                    FROM VillageRelation a
                    INNER JOIN Village b ON a.toVillageIdx = b.idx
                    WHERE a.fromVillageIdx = ${userLocationVillageIdx}
                        AND rangeLevel = ${rangeLevel};
        `;
    const [selectDongByFromIdxRangeLevelRow] = await connection.query(
        selectDongByFromIdxRangeLevelQuery
    );
    return selectDongByFromIdxRangeLevelRow;
};

module.exports = {
    selectVillageLikeDong,
    selectVillageLikeSiGunGu,
    selectVillageLikeSido,
    selectUserLocations,
    selectNumOfNearVillages,
    selectDongByFromIdxRangeLevel
};