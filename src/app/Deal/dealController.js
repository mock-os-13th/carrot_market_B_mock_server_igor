const dealProvider = require("../../app/Deal/dealProvider");
const dealService = require("../../app/Deal/dealService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");
const {emit} = require("nodemon");

/**
 * API No. 13
 * API Name : 판매 완료 API
 * [POST] /app/deals/:itemIdx
 */
 exports.postDeal = async function (req, res) {

    /**
     * Path Variable: itemIdx
     * header: jwt token
     */

    const itemIdx = req.params.itemIdx
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // DB에 글 등록
    const postItemResponse = await dealService.createDeal(
        userIdx,
        itemIdx
    );

    return res.send(postItemResponse);
};