const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const likeDao = require("./likeDao");
const userProvider = require('../User/userProvider')
const likeService = require("./likeService");
require("dotenv").config();

// Provider: Read 비즈니스 로직 처리

// 이미 등록한 관심 상품이 있는지 체크
exports.checkItemLike = async function (userIdx, itemIdx) {
    const selectItemLikeUserItemParams = [userIdx, itemIdx]
    const connection = await pool.getConnection(async (conn) => conn);
    const checkItemLikeResult = await likeDao.selectItemLikeUserItem(connection, selectItemLikeUserItemParams);
    connection.release();
  
    return checkItemLikeResult;
  };

// 관심상품 목록 조회
exports.retrieveItemLikes = async function (userIdx) {
  // userIdx DB에 존재하는지 확인
  const userStatusRows = await userProvider.checkUserStatus(userIdx);
  if (userStatusRows.length < 1)
      return errResponse(baseResponse.USER_NOT_EXIST);

  // 리스트 가져오기
  const connection = await pool.getConnection(async (conn) => conn);
  const selectItemLikesUserResult = await likeDao.selectItemLikesUser(connection, userIdx);
  connection.release();

  return response(baseResponse.SUCCESS, selectItemLikesUserResult)
};
