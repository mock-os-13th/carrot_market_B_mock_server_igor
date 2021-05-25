const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const itemDao = require("./itemDao");
const userProvider = require('../User/userProvider')
const itemService = require("./itemService");
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

// idx로 존재하는 상품인지 확인
exports.checkItemIdx = async function (itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkItemIdxResult = await itemDao.selectItemIdx(connection, itemIdx);
  connection.release();

  return checkItemIdxResult;
};

// 상품 상세정보 조회
exports.retrieveItem = async function (userIdx, itemIdx) {
    // itemIdx로 상세정보 가져오기
    const connection = await pool.getConnection(async (conn) => conn);
    const selectItemdetailsResult = await itemDao.selectItemdetails(connection, itemIdx);
    
    // 정보 추가할 수 있도록 세팅
    let itemDetails = selectItemdetailsResult[0]

    // 좋아요 여부
    const selectItemLikeParams = [userIdx, itemIdx]
    const selectItemLikeResult = await itemDao.selectItemLike(connection, selectItemLikeParams);

    if (selectItemLikeResult.length > 0) {
        itemDetails.isLiked = "YES";
    } else {
        itemDetails.isLiked = "NO";
    }
    
    // 사진    
    const selectPicturesItemIdxResult = await itemDao.selectPicturesItemIdx(connection, itemIdx);
    itemDetails.pictures = selectPicturesItemIdxResult
    
    // 판매자 상품 가져오기
    const sellerIdx = itemDetails.sellerIdx
    const selectItemsBySellerResult = await itemDao.selectItemsBySeller(connection, sellerIdx);

  // 판매자 상품 사진 1개 가져오기
    for (sellerItem of selectItemsBySellerResult) {
      const itemIdx = sellerItem.idx
      const sellerItemPicture = await itemDao.selectOnePictureItemIdx(connection, itemIdx);
      sellerItem.pictureURL = sellerItemPicture[0].pictureUrl
    }

    itemDetails.sellerItems = selectItemsBySellerResult

    // 추천 상품 가져오기 (더미 데이터)
    itemDetails.recommendedItems = selectItemsBySellerResult

    connection.release();

    return itemDetails;
  };  