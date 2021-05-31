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

// villageIdx로 실제 존재하는 village인지 확인
async function selectVillageIdx(connection, villageIdx) {
    const selectVillageIdxQuery = `
                        SELECT idx,
                         dong
                        FROM Village
                        WHERE idx = ?
        `;
    const [selectVillageIdxRow] = await connection.query(
        selectVillageIdxQuery,
        villageIdx
    );
    return selectVillageIdxRow;
};

// userLocation의 갯수를 세기 위한 쿼리
async function selectUserLocations(connection, userIdx) {
    const selectUserLocationsQuery = `
                    SELECT idx
                    FROM UserLocation
                    WHERE userIdx = ?
                        AND status = "VALID";
        `;
    const [selectUserLocationsRow] = await connection.query(
        selectUserLocationsQuery,
        userIdx
    );
    return selectUserLocationsRow;
};

// userLocationIdx의 의미적 검증 + userLocation의 userIdx와 입력된 userIdx 비교
async function selectUserIdxByIdx(connection, userLocationIdx) {
    const selectUserIdxQuery = `
                    SELECT userIdx
                    FROM UserLocation
                    WHERE idx = ?
                        AND status = "VALID";
                 `;
    const [selectUserIdxRow] = await connection.query(
        selectUserIdxQuery,
        userLocationIdx
    );
    return selectUserIdxRow;
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

// UserLocation 등록
async function insertUserLocation(connection, insertUserLocationParams) {
    const insertUserLocationQuery = `
          INSERT INTO UserLocation(userIdx, villageIdx, villageRangeLevel)
          VALUES (?, ?, ?);
      `;
    const insertUserLocationRow = await connection.query(
        insertUserLocationQuery,
        insertUserLocationParams
    );
  
    return insertUserLocationRow;
  }

// userLocation 상태 "INVALID"로 바꾸기
async function updateUserLocation(connection, userLocationIdx) {
    const updateUserLocationQuery = `
                                  UPDATE UserLocation
                                  SET status = "INVALID"
                                  WHERE idx = ?;
                                `;
    const updateUserLocationRow = await connection.query(
      updateUserLocationQuery,
      userLocationIdx
    );
  
    return updateUserLocationRow;
  }

module.exports = {
    selectVillageLikeDong,
    selectVillageLikeSiGunGu,
    selectVillageLikeSido,
    selectUserLocations,
    selectNumOfNearVillages,
    selectDongByFromIdxRangeLevel,
    selectVillageIdx,
    insertUserLocation,
    selectUserIdxByIdx,
    updateUserLocation
};