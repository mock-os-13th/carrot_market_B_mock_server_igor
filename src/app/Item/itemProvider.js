const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const itemDao = require("./itemDao");
require("dotenv").config();

const jwt = require("jsonwebtoken");

// Provider: Read 비즈니스 로직 처리

// 동일한 유저의 동일한 글이 있는지 확인
exports.checkSameItem = async function (userIdx, title) {
  const selectItemUserTitleParams = [userIdx, title]
  const connection = await pool.getConnection(async (conn) => conn);
  const checkMobileResult = await itemDao.selectItemUserTitle(connection, selectItemUserTitleParams);
  connection.release();

  return checkMobileResult;
};

// villageIdx가 존재하는지 확인
exports.checkVillageIdx = async function (villageIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkMobileResult = await itemDao.selectVillageIdx(connection, villageIdx);
    connection.release();
  
    return checkMobileResult;
  };