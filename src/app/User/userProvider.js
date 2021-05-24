const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

// 동일한 휴대폰 번호이 있는지 체크 
exports.checkMobile = async function (mobile) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkMobileResult = await userDao.selectUserMobile(connection, mobile);
  connection.release();

  return checkMobileResult;
};

//  동일한 닉네임이 있는지 체크 
exports.checkNickname = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkNicknameResult = await userDao.selectUserNickname(connection, nickname);
  connection.release();

  return checkNicknameResult;
};