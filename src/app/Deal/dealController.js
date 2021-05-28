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
     * body: itemIdx
     * header: jwt token
     */

     const { itemIdx } = req.body;
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

/**
 * API No. 14
 * API Name : 구매자 등록 API
 * [POST] /app/deals/buyers
 */
 exports.postBuyer = async function (req, res) {

    /**
     * Body : itemIdx, buyerIdx
     * header: jwt token
     */

    const { itemIdx, buyerIdx } = req.body;
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // buyerIdx 형식적 검증
    const buyerIdxVerification = inputverifier.verifyBuyerIdx(buyerIdx);
    if (!buyerIdxVerification.isValid) return res.send(errResponse(buyerIdxVerification.errorMessage)); 

    // DB에 구매자 등록
    const postBuyerResponse = await dealService.insertBuyer(
        userIdx,
        itemIdx,
        buyerIdx
    );

    return res.send(postBuyerResponse);
};

/**
 * API No. 15
 * API Name : 구매자 선택 목록 조회 API
 * [GET] /app/deals/buyers
 */
 exports.getBuyerToBeList = async function (req, res) {

    /**
     * Query String : itemIdx
     * header: jwt token
     */

    const itemIdx = req.query.itemIdx;
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // DB에서 구매자 목록 조회
    const getBuyerToBeListResponse = await dealProvider.retrieveBuyerToBeList(userIdx, itemIdx);

    return res.send(getBuyerToBeListResponse);
};

/**
 * API No. 13
 * API Name : 판매 완료 API
 * [POST] /app/deals/:itemIdx
 */
 exports.postDeal = async function (req, res) {

    /**
     * body: itemIdx
     * header: jwt token
     */

     const { itemIdx } = req.body;
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

/**
 * API No. 17
 * API Name : 거래 후기 남기기 API
 * [POST] /app/deals/reviews
 */
 exports.postReview = async function (req, res) {

    /**
     * Body : itemIdx, reviewType, score, didCome, isKind, isTimely, didAnswerQuickly, message, pictureUrl
     * header: jwt token
     */

    const { itemIdx, reviewType, score, didCome, isKind, isTimely, didAnswerQuickly, message, pictureUrl } = req.body;
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    // reviewType 형식적 검증
    const reviewTypeVerification = inputverifier.verifyReviewType(reviewType);
    if (!reviewTypeVerification.isValid) return res.send(errResponse(reviewTypeVerification.errorMessage)); 
    
    // score 형식적 검증
    const scoreVerification = inputverifier.verifyScore(score);
    if (!scoreVerification.isValid) return res.send(errResponse(scoreVerification.errorMessage));
    
    // didCome, isKind, isTimely, didAnswerQuickly 검증
    const reviewChoices = [didCome, isKind, isTimely, didAnswerQuickly]
    for (reviewChoice of reviewChoices) {
        const reviewChoiceVerification = inputverifier.verifyReviewChoice(reviewChoice);
        if (!reviewChoiceVerification.isValid) return res.send(errResponse(reviewChoiceVerification.errorMessage));
    }

    // message 검증 (존재하는 경우)
    if (message) {
        const messageVerification = inputverifier.verifyMessage(message);
        if (!messageVerification.isValid) return res.send(errResponse(messageVerification.errorMessage));
    }

    // DB에 거래 후기 등록
    const postReviewResponse = await dealService.createReview(
        userIdx,
        itemIdx, 
        reviewType, 
        score, 
        didCome, 
        isKind, 
        isTimely, 
        didAnswerQuickly, 
        message, 
        pictureUrl
    );

    return res.send(postReviewResponse);
};

/**
 * API No. 18
 * API Name : 판매 중으로 변경 API
 * [PATCH] /app/deals
 */
 exports.patchDeal = async function (req, res) {

    /**
     * Query String: itemIdx
     * header: jwt token
     */

    const itemIdx = req.query.itemIdx
    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage)); 

    const patchDealResponse = await dealService.updateDeal(
        userIdx,
        itemIdx
    );

    return res.send(patchDealResponse);
};