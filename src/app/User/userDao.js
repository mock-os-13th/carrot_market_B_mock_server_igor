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

// userIdx로 회원 상태 조회 (회원 탈퇴용)
async function selectUserStatusIdx(connection, userIdx) {
  const selectUserStatusIdxQuery = `
                SELECT status
                FROM User
                WHERE idx = ? AND status = "VALID";
                `;
  const [statusRows] = await connection.query(selectUserStatusIdxQuery, userIdx);
  return statusRows;
}

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
  selectUserIdx
};
