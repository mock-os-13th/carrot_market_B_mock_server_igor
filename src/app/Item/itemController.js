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
        return res.send(errResponse(baseResponse.PICTURE_MAY_NO_FILIED));
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

    const villageIdx = req.query.villageIdx
    const rangeLevel = req.query.rangeLevel
    const categoriesString = req.query.categories
    const lastItemIdx = req.query.lastItemIdx
    const numOfPages = req.query.numOfPages
    const categories = categoriesString.split('&')

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
    if (lastItemIdx) {
        const lastItemIdxVerification = inputverifier.verifyItemIdx(lastItemIdx);
        if (!lastItemIdxVerification.isValid) return res.send(errResponse(lastItemIdxVerification.errorMessage));
    }
    
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

/**
 * API No. 35
 * API Name : 상품 검색 API
 * [GET] /app/item-search
 */
 exports.getFilteredItemList = async function (req, res) {

     /**
     * Query String : searchWord, categories, orderBy, minPrice, maxPrice, villageIdx, rangeLevel, lastItemIdx, numOfPages
     */

    const searchWord = req.query.searchWord;
    const categoriesString = req.query.categories;
    let orderBy = req.query.orderBy;
    let minPrice = req.query.minPrice;
    let maxPrice = req.query.maxPrice;
    const villageIdx = req.query.villageIdx;
    const rangeLevel = req.query.rangeLevel;
    let lastItemIdx = req.query.lastItemIdx;
    const numOfPages = req.query.numOfPages;
    const isNoSoldout = req.query.isNoSoldout;
    

    // searchWord 검증
    const searchWordVerification = inputverifier.verifyItemSearchWord(searchWord);
    if (!searchWordVerification.isValid) return res.send(errResponse(searchWordVerification.errorMessage));

    // categories 검증 및 없을 경우 default값으로 설정
    if (!categoriesString) {
        var categories = [
            "디지털/가전",
            "가구/인테리어",
            "유아동/유아도서",
            "생활/가공식품",
            "스포츠/레저",
            "여성잡화",
            "여성의류",
            "남성패션/잡화",
            "게임/취미",
            "뷰티/미용",
            "반려동물용품",
            "도서/티켓/음반",
            "식물",
            "기타 중고물품",
            "삽니다"
        ]
    } else {
        var categories = categoriesString.split('&')
        const categoriesVerification = inputverifier.verifyCategories(categories);
        if (!categoriesVerification.isValid) return res.send(errResponse(categoriesVerification.errorMessage));
    }

    // orderBy 검증 및 없을 경우 default값으로 설정
    if (!orderBy) {
        orderBy = "accuracy"
    } else {
        const orderByVerification = inputverifier.verifyOrderBy(orderBy);
        if (!orderByVerification.isValid) return res.send(errResponse(orderByVerification.errorMessage));
    }
    
    // minPrice 검증 및 없을 경우 default값으로 설정
    if (!minPrice) {
        minPrice = 0
    } else {
        const minPriceVerification = inputverifier.verifyMinPrice(minPrice);
        if (!minPriceVerification.isValid) return res.send(errResponse(minPriceVerification.errorMessage));
    }

    // maxPrice 검증 및 없을 경우 default값으로 설정
    if (!maxPrice) {
        maxPrice = 9999999999999
    } else {
        const maxPriceVerification = inputverifier.verifyMaxPrice(maxPrice);
        if (!maxPriceVerification.isValid) return res.send(errResponse(maxPriceVerification.errorMessage));
    }

    // minPrice < maxPrice 인지 검증
    if (minPrice >= maxPrice) return res.send(errResponse(baseResponse.MIN_PRICE_BIGGER_THAN_MAX_PRICE));

    // villageIdx 검증
    const villageIdxVerification = inputverifier.verifyVillageIdx(villageIdx);
    if (!villageIdxVerification.isValid) return res.send(errResponse(villageIdxVerification.errorMessage));

    // rangeLevel 검증
    const rangeLevelVerification = inputverifier.verifyRangeLevel(rangeLevel);
    if (!rangeLevelVerification.isValid) return res.send(errResponse(rangeLevelVerification.errorMessage));

    // lastItemIdx 검증 및 없을 경우 default값으로 설정
    if (!lastItemIdx) {
        lastItemIdx = 0
    } else {
        const lastItemIdxVerification = inputverifier.verifyItemIdx(lastItemIdx);
        if (!lastItemIdxVerification.isValid) return res.send(errResponse(lastItemIdxVerification.errorMessage));
    }

    // numOfPages 검증
    const numOfPagesVerification = inputverifier.verifyItemIdx(numOfPages);
    if (!numOfPagesVerification.isValid) return res.send(errResponse(numOfPagesVerification.errorMessage));

    // isNoSoldout 검증
    const isNoSoldoutVerification = inputverifier.verifyIsNoSoldout(isNoSoldout);
    if (!isNoSoldoutVerification.isValid) return res.send(errResponse(isNoSoldoutVerification.errorMessage));

    // return res.send([searchWord, 
    //     categories, 
    //     orderBy, 
    //     minPrice, 
    //     maxPrice, 
    //     villageIdx, 
    //     rangeLevel, 
    //     lastItemIdx, 
    //     numOfPages,
    //     isNoSoldout]);
    //     // 이렇게 send로 찍어가면서 중간에 input 검증하는 것 괜찮은 것 같음

    // 검색결과 반환
    const createClickResponse = await itemService.getFilteredItemList(
        searchWord, 
        categories, 
        orderBy, 
        minPrice, 
        maxPrice, 
        villageIdx, 
        rangeLevel, 
        lastItemIdx, 
        numOfPages,
        isNoSoldout
    );

    return res.send(createClickResponse);

    
};