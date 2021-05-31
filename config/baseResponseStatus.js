module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },



    //Request error
    // 회원 정보 입력 관련
    MOBILE_EMPTY : { "isSuccess": false, "code": 2001, "message":"휴대폰 번호를 입력 해주세요." },
    MOBILE_LENGTH : { "isSuccess": false, "code": 2002, "message":"휴대폰 번호는 10~11자리로 입력 해주세요." },
    MOBILE_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"휴대폰 형식을 정확하게 입력해주세요." },
    
    VERIFICATION_CODE_EMPTY : { "isSuccess": false, "code": 2004, "message":"휴대폰 인증번호를 입력 해주세요." },
    VERIFICATION_CODE_LENGTH : { "isSuccess": false, "code": 2005, "message":"휴대폰 인증번호는 4자리로 입력 해주세요." },
    VERIFICATION_CODE_ERROR_TYPE : { "isSuccess": false, "code": 2006, "message":"휴대폰 인증번호를 숫자로만 입력해주세요." },
    VERIFICATION_CODE_NOT_MATCH : { "isSuccess": false, "code": 2007, "message":"휴대폰 인증번호가 일치하지 않습니다." },
    
    NICKNAME_EMPTY : { "isSuccess": false, "code": 2008, "message":"닉네임을 입력 해주세요." },
    NICKNAME_LENGTH : { "isSuccess": false,"code": 2009,"message":"닉네임은 최대 10자리를 입력해주세요." },

    JWT_USERIDX_EMPTY : { "isSuccess": false, "code": 2010, "message":"JWT 토큰에 userIdx가 존재하지 않습니다." },
    JWT_USERIDX_NaN : { "isSuccess": false,"code": 2011,"message":"JWT 토큰의 userIdx가 숫자가 아닙니다." },

    ITEM_TITLE_EMPTY : { "isSuccess": false,"code": 2012,"message":"중고거래 글 제목을 입력해주세요." },
    ITEM_TITLE_LENGTH : { "isSuccess": false,"code": 2013,"message":"중고거래 글 제목은 100자 이내로 써주세요." },
    
    ITEM_CATEGORY_EMPTY : { "isSuccess": false,"code": 2014,"message":"카테고리를 입력해주세요." },
    ITEM_CATEGORY_ERROR_TYPE : { "isSuccess": false,"code": 2015,"message":"존재하지 않는 카테고리 종류입니다." },

    ITEM_PRICE_NAN : { "isSuccess": false,"code": 2016,"message":"가격은 숫자로 입력해주세요." },
    ITEM_PRICE_UNDER_ZERO : { "isSuccess": false,"code": 2017,"message":"가격을 0 이상의 값으로 입력해주세요." },

    ITEM_IS_NEGOTIABLE_EMPTY : { "isSuccess": false,"code": 2018,"message":"가격제안 가능한지 입력해주세요." },
    ITEM_IS_NEGOTIABLE_ERROR_TYPE : { "isSuccess": false,"code": 2019,"message":"가격제안 가능여부는 YES 혹은 NO로 입력해주세요." },

    ITEM_CONTENT_EMPTY : { "isSuccess": false,"code": 2020,"message":"중고거래 글 내용을 입력해주세요." },
    ITEM_CONTENT_LENGTH : { "isSuccess": false,"code": 2021,"message":"중고거래 글 내용을 2000자 이내로 써주세요." },
    
    VILLAGE_IDX_EMPTY : { "isSuccess": false,"code": 2022,"message":"동네 idx를 입력해주세요." },
    VILLAGE_IDX_NAN : { "isSuccess": false,"code": 2023,"message":"동네 idx를 숫자로 입력해주세요." },

    RANGE_LEVEL_EMPTY : { "isSuccess": false,"code": 2024,"message":"동네 범위를 입력해주세요." },
    RANGE_LEVEL_ERROR_TYPE : { "isSuccess": false,"code": 2025,"message":"동네 범위는 1, 2, 3, 4 중에 하나의 값으로 입력해주세요." },

    ITEM_IDX_EMPTY : { "isSuccess": false,"code": 2026,"message":"상품 idx를 입력해주세요." },
    ITEM_IDX_NAN : { "isSuccess": false,"code": 2027,"message":"상품 idx를 숫자로 입력해주세요." },

    PICTURES_TOO_MANY : { "isSuccess": false,"code": 2028,"message":"사진은 최대 10장까지만 업로드할 수 있습니다." },
    PICTURE_NO_FILE_ID : { "isSuccess": false,"code": 2029,"message":"fileId가 누락된 사진이 있습니다." },
    PICTURE_NO_FILE_URL : { "isSuccess": false,"code": 2030,"message":"fileUrl이 누락된 사진이 있습니다." },
    PICTURE_MAY_NO_FILIED : { "isSuccess": false,"code": 2031,"message":"pictures field가 누락된 것 같습니다. 첨부 사진이 없다면 빈배열을 보내야합니다. 해당없다면 서버개발자에게 연락주세요." },

    CATEGORIES_EMPTY : { "isSuccess": false,"code": 2032,"message":"최소한 하나 이상의 카테고리를 입력해야 합니다." },
    CATEGORIES_WITH_INVALID_CATEGORY : { "isSuccess": false,"code": 2033,"message":"잘못된 카테고리를 포함하고 있습니다." },
    
    NUM_OF_PAGES_EMPTY : { "isSuccess": false,"code": 2034,"message":"페이지 수를 입력해주세요." },
    NUM_OF_PAGES_UNDER_ONE : { "isSuccess": false,"code": 2035,"message":"페이지 수는 1 이상의 수를 입력해야 합니다." },

    CATEGORIES_MAY_NO_FILIED : { "isSuccess": false,"code": 2036,"message":"categories field가 누락된 것 같습니다. 최소한 1개의 카테고리를 포함한 배열을 보내야합니다. 해당없다면 서버개발자에게 연락주세요." },

    BUYER_IDX_EMPTY : { "isSuccess": false,"code": 2037,"message":"구매자 idx를 입력해주세요." },
    BUYER_IDX_NAN : { "isSuccess": false,"code": 2038,"message":"구매자 idx를 숫자로 입력해주세요." },

    REVIEW_TYPE_EMPTY : { "isSuccess": false,"code": 2039,"message":"reviewType을 입력해주세요." },
    REVIEW_TYPE_ERROR_TYPE : { "isSuccess": false,"code": 2040,"message":"reviewType은 SELLER 또는 BUYER로 입력해야 합니다." },

    REVIEW_SCORE_EMPTY : { "isSuccess": false,"code": 2041,"message":"score를 입력해주세요." },
    REVIEW_SCORE_ERROR_TYPE : { "isSuccess": false,"code": 2042,"message":"score는 BEST, GOOD 또는 SOSO로 입력해야 합니다." },

    REVIEW_CHOICE_EMPTY : { "isSuccess": false,"code": 2043,"message":"거래 후기 4개 문항의 결과를 모두 입력해주세요." },
    REVIEW_CHOICE_ERROR_TYPE : { "isSuccess": false,"code": 2044,"message":"거래 후기 문항은 YES 혹은 NO로 입력해야 합니다." },
    
    REVIEW_MESSAGE_LENGTH : { "isSuccess": false,"code": 2045,"message":"거래 후기 내용은 1000자 이내로 입력해야 합니다." },

    USERIDX_EMPTY : { "isSuccess": false,"code": 2046,"message":"userIdx를 입력해주세요." },
    USERIDX_NaN : { "isSuccess": false,"code": 2047,"message":"userIdx를 숫자로 입력해주세요." },

    SEARCH_WORD_EMPTY : { "isSuccess": false,"code": 2048,"message":"검색어를 입력해주세요." },
    SEARCH_WORD_LENGTH : { "isSuccess": false,"code": 2049,"message":"검색어를 10자 이내로 입력해주세요." },

    // Response error
    REDUNDANT_MOBILE : { "isSuccess": false, "code": 3001, "message":"이미 가입한 계정입니다. 로그인해주세요." },
    REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    OVERLAPPING_MOBILE : { "isSuccess": false, "code": 3003, "message": "입력한 전화번호로 가입한 회원이 여러 명입니다. 고객센터에 문의하세요." },
    INVALID_USER : { "isSuccess": false, "code": 3004, "message": "유효하지 않은 계정입니다. 고객센터에 문의하세요." },

    USER_NOT_EXIST : { "isSuccess": false, "code": 3005, "message": "존재하지 않는 회원입니다." },

    ITEM_REDUNDANT : { "isSuccess": false, "code": 3006, "message": "같은 제목의 글을 다시 쓸 수 없습니다." },

    VILLAGE_NOT_EXIST : { "isSuccess": false, "code": 3007, "message": "존재하지 않는 동네입니다." },

    ITEM_NOT_EXIST : { "isSuccess": false, "code": 3008, "message": "존재하지 않는 상품입니다." },

    LAST_ITEM_NOT_EXIST : { "isSuccess": false, "code": 3009, "message": "마지막 상품이 존재하지 않습니다." },

    USER_NOT_MATCH: { "isSuccess": false, "code": 3010, "message": "상품을 등록한 사용자가 아닙니다." },
  
    ITEM_NOT_SOLD_OUT: { "isSuccess": false, "code": 3011, "message": "거래 완료된 상품이 아닙니다." },

    REVIEW_REDUNDANT : { "isSuccess": false, "code": 3012, "message": "이미 상품에 대해 작성한 리뷰가 있습니다." },

    ITEM_ALREADY_ON_SALE : { "isSuccess": false, "code": 3013, "message": "이미 판매 중인 상품입니다." },

    SELLER_NOT_EXIST : { "isSuccess": false, "code": 3014, "message": "존재하지 않는 판매자입니다." },

    REJOIN_TOO_SOON : { "isSuccess": false, "code": 3015, "message": "동일한 휴대번호로 가입한 계정이 탈퇴한지 일주일이 안되었습니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
 
    // 형식적 검증 에러
    INPUT_VERIFIER_ERROR: { "isSuccess": false, "code": 5001, "message": "유효한 검증값이지만 에러가 발생했습니다. 서버개발자에게 연락주세요."},
    // JWT 토큰 관련
    TOKEN_EMPTY : { "isSuccess": false, "code": 5002, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 5003, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 5004, "message":"JWT 토큰 검증 성공" }

}
