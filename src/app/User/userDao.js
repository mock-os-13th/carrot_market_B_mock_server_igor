// 휴대 전화로 회원 조회
async function selectUserMobile(connection, mobile) {
  const selectUserMobileQuery = `
                SELECT idx
                FROM User
                WHERE mobileNum = ? AND status = "VALID";
                `;
  const [mobileRows] = await connection.query(selectUserMobileQuery, mobile);
  return mobileRows;
}

// 닉네임으로 회원 조회
async function selectUserNickname(connection, nickname) {
  const selectUserNicknameQuery = `
                SELECT idx
                FROM User
                WHERE nickName = ? AND status = "VALID";
                `;
  const [nicknameRows] = await connection.query(selectUserNicknameQuery, nickname);
  return nicknameRows;
}

// userIdx로 닉네임 가져오기
async function selectNicknameIdx(connection, userIdx) {
  const selectUserNicknameQuery = `
                SELECT nickName
                FROM User
                WHERE idx = ? AND status = "VALID";
                `;
  const [nicknameRows] = await connection.query(selectUserNicknameQuery, userIdx);
  return nicknameRows;
}

// 휴대 전화로 회원 조회 (로그인용)
async function selectUserDetailMobile(connection, mobile) {
  const selectUserDetailMobileQuery = `
                SELECT idx, status
                FROM User
                WHERE mobileNum = ? AND status = "VALID";
                `;
  const [mobileRows] = await connection.query(selectUserDetailMobileQuery, mobile);
  return mobileRows;
}

// userIdx로 회원 상태 조회 (회원 탈퇴 및 사용자 idx 의미적 검증용)
async function selectUserStatusIdx(connection, userIdx) {
  const selectUserStatusIdxQuery = `
                SELECT status
                FROM User
                WHERE idx = ? AND status = "VALID";
                `;
  const [statusRows] = await connection.query(selectUserStatusIdxQuery, userIdx);
  return statusRows;
}

// userIdx로 회원 이름 반환

// userIdx로 회원 간단 정보 조회 (나의 당근 메인페이지용)
async function selectUserIdx(connection, userIdx) {
  const selectUserIdxQuery = `
                  SELECT a.idx AS userIdx,
                  a.profilePictureUrl,
                  a.nickName,
                  b.dong
                FROM User a
                LEFT JOIN (SELECT UL.userIdx,
                      V.dong
                  FROM UserLocation UL
                  INNER JOIN Village V ON UL.villageIdx = V.idx
                  GROUP BY userIdx) b ON a.idx = b.userIdx
                WHERE a.idx = ? AND a.status = "VALID";
                `;
  const [userRow] = await connection.query(selectUserIdxQuery, userIdx);
  return userRow;
}

// 반환할 회원 위치 조회
async function selectUserLocation(connection, userIdx) {
  const selectUserLocationQuery = `
        SELECT a.idx,
          a.villageIdx,
          b.dong,
          a.villageRangeLevel,
          a.isAuthorized
        FROM UserLocation a
        INNER JOIN Village b ON a.villageIdx = b.idx
        WHERE a.userIdx = ?;
                `;
  const [userLocationRows] = await connection.query(selectUserLocationQuery, userIdx);
  return userLocationRows;
}

// 판매 중인 물품 목록 조회
async function selectSellingItemsUser(connection, userIdx) {
  const selectUserLocationQuery = `
                SELECT
                a.idx,
                a.title,
                b.pictureUrl,
                c.dong,
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
                IFNULL(c.chats, 0) AS numOfChats,
                IFNULL(d.likes, 0) AS numOfLikes
                FROM Item a
                LEFT JOIN (SELECT itemIdx, pictureUrl FROM ItemPictures GROUP BY itemIdx) b ON a.idx = b.itemIdx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS chats  FROM ChatRoom GROUP BY itemIdx) c ON a.idx = c.itemIdx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS likes  FROM LikeItem GROUP BY itemIdx) d ON a.idx = d.itemIdx
                INNER JOIN Village c ON a.villageIdx = c.idx
                WHERE a.userIdx = ?
                  AND a.status = "ONSALE"
                ORDER BY a.onTopAt DESC;
                `;
  const [sellingItemRows] = await connection.query(selectUserLocationQuery, userIdx);
  return sellingItemRows;
};

// 판매 완료 물품 목록 조회
async function selectSoldItemsUser(connection, userIdx) {
  const selectSoldItemsUserQuery = `
                SELECT
                a.idx,
                a.title,
                b.pictureUrl,
                c.dong,
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
                IFNULL(c.chats, 0) AS numOfChats,
                IFNULL(d.likes, 0) AS numOfLikes
                FROM Item a
                LEFT JOIN (SELECT itemIdx, pictureUrl FROM ItemPictures GROUP BY itemIdx) b ON a.idx = b.itemIdx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS chats  FROM ChatRoom GROUP BY itemIdx) c ON a.idx = c.itemIdx
                LEFT JOIN (SELECT itemIdx, COUNT(*) AS likes  FROM LikeItem GROUP BY itemIdx) d ON a.idx = d.itemIdx
                INNER JOIN Village c ON a.villageIdx = c.idx
                WHERE a.userIdx = ?
                  AND a.status = "SOLDOUT"
                ORDER BY a.onTopAt DESC;
                `;
  const [soldItemRows] = await connection.query(selectSoldItemsUserQuery, userIdx);
  return soldItemRows;
};

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(mobileNum, nickName)
        VALUES (?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 유저 상태 변경
async function updateUserStatus(connection, updateUserStatusParams) {
  const updateUserStatusQuery = `
      UPDATE User
      SET status = ?
      WHERE idx = ?;
    `;
  const insertUserInfoRow = await connection.query(
    updateUserStatusQuery,
    updateUserStatusParams
  );

  return insertUserInfoRow;
}




module.exports = {
  selectUserMobile,
  selectUserNickname,
  insertUserInfo,
  selectUserDetailMobile,
  selectUserLocation,
  selectUserStatusIdx,
  updateUserStatus,
  selectUserIdx,
  selectNicknameIdx,
  selectSellingItemsUser,
  selectSoldItemsUser
};
