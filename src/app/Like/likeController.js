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
 * [POST] /app/likes/:itemIdx
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