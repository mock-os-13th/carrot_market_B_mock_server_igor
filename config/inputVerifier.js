// 이 모듈은 request에 포함된 데이터의 형식적 검증을 위한 것임.

// 외부 모듈
    // response 메시지
    const baseResponse = require("./baseResponseStatus");
    // 입력값 검증용 정규표현식
const regexEmail = require("regex-email");
const regexNum= /^[0-9]+$/;
const regexMobile = /(01[016789])([1-9]{1}[0-9]{2,3})([0-9]{4})$/;

// 1. 휴대폰 번호 검증
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

// 2. 휴대폰 인증번호 검증
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

// 2. NickName 검증
exports.verifyNickName = function(nickName) {
    // 3-1. 빈 값
    if (!nickName) {
        return {isValid: false, errorMessage: baseResponse.NICKNAME_EMPTY};
    // 3-2. 길이 (30자 미만)
    } else if (nickName.length > 30) {
        return {isValid: false, errorMessage: baseResponse.NICKNAME_LENGTH};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
}


// idx 검증

// 1. userIdx 검증
exports.verifyUserIdx = async function(userIdx) {
    // 1-1. 빈 값
    if (!userIdx) {
        return {isValid: false, errorMessage: baseResponse.USER_USERIDX_EMPTY};
    // 1-2. 숫자 여부
    } else if (!regexNum.test(userIdx)) {
        return {isValid: false, errorMessage: baseResponse.USER_USERIDX_NaN};
    } else {
        return {isValid: true, errorMessage: baseResponse.INPUT_VERIFIER_ERROR};
    }
}
