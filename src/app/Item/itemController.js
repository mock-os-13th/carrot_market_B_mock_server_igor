const itemProvider = require("../../app/Item/itemProvider");
const itemService = require("../../app/Item/itemService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");


/**
 * API No. 7
 * API Name : 물품 등록 API (사진 미구현)
 * [POST] /app/items
 */
 exports.postItem = async function (req, res) {

    /**
     * Body: title, category, price, isNegotiable, content, villageIdx, rangeLevel
     * header: jwt token
     */
    const { title, category, price, isNegotiable, content, villageIdx, rangeLevel } = req.body;
    const userIdx = req.verifiedToken.userIdx;

    // body 형식적 검증
    const ItemPostBodyVerification = inputverifier.verifyItemPostBody(req.body);
    if (!ItemPostBodyVerification.isValid) return res.send(errResponse(ItemPostBodyVerification.errorMessage));

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // DB에 글 등록
    const postItemResponse = await itemService.createItem(
        userIdx,
        title, 
        category, 
        price, 
        isNegotiable, 
        content, 
        villageIdx, 
        rangeLevel
    );

    return res.send(postItemResponse);
};