const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const itemDao = require("./itemDao");
const userProvider = require('../User/userProvider')
const locationProvider = require('../Location/locationProvider')
const itemService = require("./itemService");
const util = require('../../../config/util')
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

// idx로 존재하는 상품인지 확인 (DELETED 상품만 제외)
exports.checkItemIdx = async function (itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkItemIdxResult = await itemDao.selectItemIdx(connection, itemIdx);
  connection.release();

  return checkItemIdxResult;
};

// 판매완료된 상품인지 조회
exports.checkSoldItemIdx = async function (itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkSoldItemIdxResult = await itemDao.selectSoldItemIdx(connection, itemIdx);
  connection.release();

  return checkSoldItemIdxResult;
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
      if (sellerItemPicture.length > 0) { // 블로그에 정리하기! 일종의 optional binding
        sellerItem.pictureURL = sellerItemPicture[0].pictureUrl
      } else {
        sellerItem.pictureURL = null
      }
    };

    itemDetails.sellerItems = selectItemsBySellerResult

    // 추천 상품 가져오기 (더미 데이터)
    itemDetails.recommendedItems = selectItemsBySellerResult

    // 조회하고 있는 사람 nickname
    const viewerNicknameRow = await userProvider.retrieveUserNickname(userIdx)
    const viewerNickname = viewerNicknameRow[0].nickName

    itemDetails.userNickname = viewerNickname

    connection.release();

    return itemDetails;
  };  

  // 홈 화면용 상품 목록 가져오기
exports.retrieveItemList = async function (villageIdx, rangeLevel, categories, lastItemIdx, numOfPages) {
  // villageIdx 의미적 검증 (있는것인지!)
    // 나중에 villageProvider 생기면 구현!

  // 범위에 따른 screening process -> 나중에 villageRelation 구현되면 확인할 것

  // 여기 코드 엉망임 자바스크립트 좀 더 배우고 나서 제대로 만들어 보기!!
  const connection = await pool.getConnection(async (conn) => conn);
  if (!lastItemIdx) {
    lastItemIdx = 0
  }
  const selectOnTopAtResult = await itemDao.selectOnTopAt(connection, lastItemIdx);
  const lastItemUnixTimestamp = selectOnTopAtResult[0]

  const cursor = util.makeCursor(lastItemUnixTimestamp, lastItemIdx)

  // 카테고리 필터용 문자열로 만들기
  const categoryFilter = util.arrayToString(categories)
  // 리스트 가져오기
  const selectItemsForListParams = [categoryFilter, cursor, numOfPages]
  const retrieveItemListResult = await itemDao.selectItemsForList(connection, selectItemsForListParams);

  connection.release();
  return response(baseResponse.SUCCESS, retrieveItemListResult)
};

// if (lastItemIdx) { // lastItemIdx 있을 때
//   // 전 페이지의 마지막 상품의 cursor 구하기    
//   const selectOnTopAtResult = await itemDao.selectOnTopAt(connection, lastItemIdx);
//   // 혹시 마지막 item이 존재 하지 않는지 검증
//   if (selectOnTopAtResult.length < 1) {
//     return errResponse(baseResponse.LAST_ITEM_NOT_EXIST); 
//   } else {
//     // cursor에 해당하는 문자열 만들기
//     const onTopAtCursor = selectOnTopAtResult[0].onTopAtCursor
//     const cursor = util.lpad(onTopAtCursor, 15, 0) + util.lpad(lastItemIdx, 15, 0)
//   }
// } else {
//   const cursor = "999999999999999999999999999999"
// }

// 상품 이름으로 검색 + 각종 검색 필터
exports.getFilteredItemList = async function (searchWord, categories, orderBy, minPrice, maxPrice, villageIdx, rangeLevel, lastItemIdx, numOfPages, isNoSoldout) {
  try {
    // villageIdx 의미적 검증
    const villageRow = await itemProvider.checkVillageIdx(villageIdx);
    if (villageRow.length < 1)
        return errResponse(baseResponse.VILLAGE_NOT_EXIST);

    const connection = await pool.getConnection(async (conn) => conn);
    const selectOnTopAtResult = await itemDao.selectOnTopAt(connection, lastItemIdx);
    const lastItemUnixTimestamp = selectOnTopAtResult[0]
    const cursor = util.makeCursor(lastItemUnixTimestamp, lastItemIdx)




    return response(baseResponse.SUCCESS, )
  } catch (err) {
    logger.error(`App - getFilteredItemList Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};