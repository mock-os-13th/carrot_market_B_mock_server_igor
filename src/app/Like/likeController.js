const jwtMiddleware = require("../../../config/jwtMiddleware");
const likeProvider = require("../../app/Like/likeProvider");
const likeService = require("../../app/Like/likeService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

/*
 * API No. 11
 * API Name : 관심상품 등록/취소 API
 * [POST] /app/likes/items/:itemIdx
 */
 exports.postItemLike = async function (req, res) {

    /**
     * Path Variable: itemIdx
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;
    const itemIdx = req.params.itemIdx;

    // userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage));

    const createOrDeleteItemLikeResponse = await likeService.createOrDeleteItemLike(
        userIdx, 
        itemIdx
    );

    return res.send(createOrDeleteItemLikeResponse);

};

/**
 * API No. 12
 * API Name :관심상품 목록 조회 API
 * [GET] /app/likes/items
 */
 exports.getItemLikes = async function (req, res) {

    /*
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // 관심 상품 조회
    const retrieveItemLikesResponse = await likeProvider.retrieveItemLikes(userIdx);

    return res.send(retrieveItemLikesResponse);

    
};

/*
 * API No. 23
 * API Name : 판매자 모아보기 등록/취소 API
 * [POST] /app/likes/sellers/:userIdx
 */
exports.postUserLike = async function (req, res) {

    /**
     * Path Variable: userIdx
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;
    const sellerIdx = req.params.sellerIdx;

    // userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // seller 형식적 검증
    const sellerIdxVerification = inputverifier.verifyUserIdxNotFromJwt(sellerIdx);
    if (!sellerIdxVerification.isValid) return res.send(errResponse(sellerIdxVerification.errorMessage));

    const createOrDeleteSellerLikeResponse = await likeService.createOrDeleteSellerLike(
        userIdx, 
        sellerIdx
    );

    return res.send(createOrDeleteSellerLikeResponse);

};