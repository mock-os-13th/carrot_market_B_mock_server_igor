const itemProvider = require("../../app/Item/itemProvider");
const itemService = require("../../app/Item/itemService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");
const {emit} = require("nodemon");


/**
 * API No. 7
 * API Name : 물품 등록 API
 * [POST] /app/items
 */
 exports.postItem = async function (req, res) {

    /**
     * Body: title, category, price, isNegotiable, content, villageIdx, rangeLevel, pictures
     * header: jwt token
     */

    const { title, category, price, isNegotiable, content, villageIdx, rangeLevel, pictures } = req.body;
    const userIdx = req.verifiedToken.userIdx;

    // body 형식적 검증
    const ItemPostBodyVerification = inputverifier.verifyItemPostBody(req.body);
    if (!ItemPostBodyVerification.isValid) return res.send(errResponse(ItemPostBodyVerification.errorMessage));

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // pictures 형식적 검증
    try {
        if (pictures.length > 0) {
            const picturesVerification = inputverifier.verifyPictures(pictures); 
            if (!picturesVerification.isValid) return res.send(errResponse(picturesVerification.errorMessage)) 
        }
    } catch (err) {
        console.log(err)
        return res.send(errResponse(baseResponse.PICTURE_MAY_NO_FILED));
    }    

    // DB에 글 등록
    const postItemResponse = await itemService.createItem(
        userIdx,
        title, 
        category, 
        price, 
        isNegotiable, 
        content, 
        villageIdx, 
        rangeLevel,
        pictures
    );

    return res.send(postItemResponse);
};

/**
 * API No. 8
 * API Name : 물품 상세 조회 API (일부 더미 데이터)
 * [GET] /app/items/:itemIdx
 */
 exports.getItem = async function (req, res) {

    /**
     * Path Variable: itemIdx
     * header: jwt token
     */
    const itemIdx = req.params.itemIdx;
    const userIdx = req.verifiedToken.userIdx;

    // itemIdx 형식적 검증
    const itemIdxVerification = inputverifier.verifyItemIdx(itemIdx);
    if (!itemIdxVerification.isValid) return res.send(errResponse(itemIdxVerification.errorMessage));

    // userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // DB에 클릭 등록
    const createClickResponse = await itemService.createClick(
        userIdx, 
        itemIdx
    );

    return res.send(createClickResponse);

    
};

/**
 * API No. 9
 * API Name : 물품 목록 조회 API (홈화면)
 * [GET] /app/items
 */
 exports.getItemList = async function (req, res) {

    /**
     * Body: villageIdx, rangeLevel, categories, lastItemIdx, numOfPages
     */

    const { villageIdx, rangeLevel, categories, lastItemIdx, numOfPages } = req.body;

    // villageIdx 형식적 검증
    const villageIdxVerification = inputverifier.verifyVillageIdx(villageIdx);
    if (!villageIdxVerification.isValid) return res.send(errResponse(villageIdxVerification.errorMessage));

    // rangeLevel 형식적 검증
    const rangeLevelVerification = inputverifier.verifyRangeLevel(rangeLevel);
    if (!rangeLevelVerification.isValid) return res.send(errResponse(rangeLevelVerification.errorMessage));

    // categories 형식적 검증
    const categoriesVerification = inputverifier.verifyCategories(categories);
    if (!categoriesVerification.isValid) return res.send(errResponse(categoriesVerification.errorMessage));
    
    // lastItemIdx 형식적 검증
    const lastItemIdxVerification = inputverifier.verifyItemIdx(lastItemIdx);
    if (!lastItemIdxVerification.isValid) return res.send(errResponse(lastItemIdxVerification.errorMessage));
    

    // numOfPages 형식적 검증
    const numOfPagesVerification = inputverifier.verifyItemIdx(numOfPages);
    if (!numOfPagesVerification.isValid) return res.send(errResponse(numOfPagesVerification.errorMessage));

    // 글 목록 찾아오기
    const retrieveItemListResponse = await itemProvider.retrieveItemList(
        villageIdx, 
        rangeLevel, 
        categories, 
        lastItemIdx, 
        numOfPages
    );

    return res.send(retrieveItemListResponse);
};