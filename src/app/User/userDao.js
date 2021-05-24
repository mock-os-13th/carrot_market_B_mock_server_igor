// 이메일로 회원 조회
async function selectUserMobile(connection, mobile) {
  const selectUserMobileQuery = `
                SELECT idx
                FROM User
                WHERE mobileNum = ?;
                `;
  const [mobileRows] = await connection.query(selectUserMobileQuery, mobile);
  return mobileRows;
}

// 닉네임으로 회원 조회
async function selectUserNickname(connection, nickname) {
  const selectUserNicknameQuery = `
                SELECT idx
                FROM User
                WHERE nickName = ?;
                `;
  const [nicknameRows] = await connection.query(selectUserNicknameQuery, nickname);
  return nicknameRows;
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


module.exports = {
  selectUserMobile,
  selectUserNickname,
  insertUserInfo
};
