// 이 모듈은 request에 포함된 데이터의 형식적 검증을 위한 것임.

// 외부 모듈
// response 메시지
const baseResponse = require("./baseResponseStatus");
    // 입력값 검증용 정규표현식
const regexEmail = require("regex-email");
const regexNum= /^[0-9]+$/;
const regexMobile = /(01[016789])([1-9]{1}[0-9]{2,3})([0-9]{4})$/;

const categories = [
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

const rangeLevels = ["1", "2", "3", "4", 1, 2, 3, 4]

// 휴대폰 번호 검증
exports.verifyMobile = function(mobile) {
    // 빈 값
    if (!mobile) {
        return {isValid: false, errorMessage: baseResponse.MOBILE_EMPTY};
    // 길이 (10 or 11자리)
    } else if (mobile.length > 11 || mobile.length < 10) {
        return {isValid: false, errorMessage: baseResponse.MOBILE_LENGTH};
    // 형식 (by 정규표현식)
    } else if (!regexMobile.test(mobile))  {
        return {isValid: false, errorMessage: baseResponse.MOBILE_ERROR_TYPE};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
}

// 휴대폰 인증번호 검증
exports.verifyCode = function(verificationCode) {
    // 빈 값
    if (!verificationCode) {
        return {isValid: false, errorMessage: baseResponse.VERIFICATION_CODE_EMPTY};
    // 길이 (4자리)
    } else if (verificationCode.length != 4) {
        return {isValid: false, errorMessage: baseResponse.VERIFICATION_CODE_LENGTH};
    // 형식 (by 정규표현식)
    } else if (!regexNum.test(verificationCode))  {
        return {isValid: false, errorMessage: baseResponse.VERIFICATION_CODE_ERROR_TYPE};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
}

// NickName 검증
exports.verifyNickname = function(nickname) {
    // 빈 값
    if (!nickname) {
        return {isValid: false, errorMessage: baseResponse.NICKNAME_EMPTY};
    // 길이 (10자 미만)
    } else if (nickname.length > 10) {
        return {isValid: false, errorMessage: baseResponse.NICKNAME_LENGTH};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
}


// userIdx 검증
exports.verifyUserIdx = function(userIdx) {
    // 빈 값
    if (!userIdx) {
        return {isValid: false, errorMessage: baseResponse.USERIDX_EMPTY};
    // 숫자 여부
    } else if (!regexNum.test(userIdx)) {
        return {isValid: false, errorMessage: baseResponse.USERIDX_NaN};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
};

// itemIdx 검증
exports.verifyItemIdx = function(itemIdx) {
    // 빈 값
    if (!itemIdx) {
        return {isValid: false, errorMessage: baseResponse.ITEM_IDX_EMPTY};
    // 숫자 여부
    } else if (!regexNum.test(itemIdx)) {
        return {isValid: false, errorMessage: baseResponse.ITEM_IDX_NAN};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
};

 // 중고 거래 글 body 검증
 exports.verifyItemPostBody = function(body) {
    const { title, category, price, isNegotiable, content, villageIdx, rangeLevel } = body;

    // 제목 검증
        // 유무
        // 길이 (100자)
    if (!title) {
        return {isValid: false, errorMessage: baseResponse.ITEM_TITLE_EMPTY};
    } else if (title.length > 100) {
        return {isValid: false, errorMessage: baseResponse.ITEM_TITLE_LENGTH};
    }

    // 카테고리 검증
        // 카테고리 있는 것인지 검증
        // category 범주에 있는 것인지 검증
    if (!category) {
        return {isValid: false, errorMessage: baseResponse.ITEM_CATEGORY_EMPTY};
    } else if (!categories.includes(category)) {
        return {isValid: false, errorMessage: baseResponse.ITEM_CATEGORY_ERROR_TYPE};
    }
    
    // 가격 검증
        // 값이 있는지 먼저 확인하고 있으면 검증
            // 숫자인지 검증
            // 음수인지 검증
    if (price) {
        if (!regexNum.test(price)) {
            return {isValid: false, errorMessage: baseResponse.ITEM_PRICE_NAN};
        } else if (price < 0) {
            return {isValid: false, errorMessage: baseResponse.ITEM_PRICE_UNDER_ZERO};
        }
    }    

    // isNegotiable 검증
        // 있는지 검증
        // YES NO 인지 검증

    if (!isNegotiable) {
        return {isValid: false, errorMessage: baseResponse.ITEM_IS_NEGOTIABLE_EMPTY};
    } else if (!(isNegotiable === "YES" || isNegotiable === "NO")) {
        return {isValid: false, errorMessage: baseResponse.ITEM_IS_NEGOTIABLE_ERROR_TYPE};
    }

    // content 검증
        // 있는지 검증
        // 길이 검증 (2000자)
    if (!content) {
        return {isValid: false, errorMessage: baseResponse.ITEM_CONTENT_EMPTY};
    } else if (content.length > 2000) {
        return {isValid: false, errorMessage: baseResponse.ITEM_CONTENT_LENGTH};
    }

    // villageIdx 검증
        // 있는지 검증
        // 숫자인지 검증
    if (!villageIdx) {
        return {isValid: false, errorMessage: baseResponse.VILLAGE_IDX_EMPTY};
    } else if (!regexNum.test(villageIdx)) {
        return {isValid: false, errorMessage: baseResponse.VILLAGE_IDX_NAN};
    }

    // rangeLevel 검증
        // 있는지 검증
        // 1, 2, 3, 4 인지 검증
    if (!rangeLevel) {
        return {isValid: false, errorMessage: baseResponse.RANGE_LEVEL_EMPTY};
    } else if (!rangeLevels.includes(rangeLevel)) {
        return {isValid: false, errorMessage: baseResponse.RANGE_LEVEL_ERROR_TYPE};
    }

    return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR}; 

};