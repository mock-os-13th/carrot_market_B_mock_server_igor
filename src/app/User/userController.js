const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const locationProvider = require("../Location/locationProvider")
const locationService = require("../Location/locationService")
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const {emit} = require("nodemon");


/**
 * API No. 1
 * API Name : 휴대폰 인증번호 받기 API (임시)
 * [GET] app/users/mobile-check
 */
exports.getMobileCheck = async function (req, res) {

    /**
     * Query String: mobile
     */

     const mobile = req.query.mobile;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // // 회원 가입 여부 확인 -> 클라이언트에서 빼달라고 함
    // const isMakableMobile = await userProvider.checkMobile(mobile)
    // if (isMakableMobile.length > 0 && isMakableMobile[0].status === "VALID")
    //     return res.send(errResponse(baseResponse.REDUNDANT_MOBILE)); 

    const interimResult = { "interimMessage" : "개발용 임시 인증코드는 1234입니다."}

    return res.send(response(baseResponse.SUCCESS, interimResult));

};

/**
 * API No. 2
 * API Name : 회원 가입 휴대폰 인증 API (임시)
 * [POST] app/users/mobile-check
 */

 exports.postMobileCheckSignUp = async function (req, res) {

    /**
     * Body: mobile, verificationCode
     */

    const { mobile, verificationCode } = req.body;

    // 휴대폰 번호 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // 인증번호 형식적 검증
    const verificationCodeVerification = inputverifier.verifyCode(verificationCode);
    if (!verificationCodeVerification.isValid) return res.send(errResponse(verificationCodeVerification.errorMessage));

    // 회원 가입 여부 확인
    const isMakableMobile = await userProvider.checkMobile(mobile)
    if (isMakableMobile.length > 0 && isMakableMobile[0].status === "VALID") { // 이미 있는 회원이면
        return res.send(errResponse(baseResponse.REDUNDANT_MOBILE)); 
    } else if (isMakableMobile.length > 0 && isMakableMobile[0].status === "DELETED") { // 이미 삭제 회원이면
        if (isMakableMobile[0].isRemakable === "NO") // 그런데 1주일이 안지나서 다시 가입라려고 하면
            return res.send(errResponse(baseResponse.REJOIN_TOO_SOON));  
    }

    // 인증번호 일치여부 확인
    if (verificationCode === "1234") {
        return res.send(response(baseResponse.SUCCESS)); 
    } else {
        return res.send(errResponse(baseResponse.VERIFICATION_CODE_NOT_MATCH))
    }

};


/**
 * API No. 3
 * API Name : 회원가입 API (닉네임 등록)
 * [POST] app/users/mobile-check
 */
 exports.postUser = async function (req, res) {

    /**
     * Body: mobile, nickName, pictureId, pictureUrl
     */

    let { mobile, nickname, pictureId, pictureUrl } = req.body;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // 닉네임 형식적 검증
    const nicknameVerification = inputverifier.verifyNickname(nickname);
    if (!nicknameVerification.isValid) return res.send(errResponse(nicknameVerification.errorMessage));

    // pictureId, pictureUrl 중 하나만 있는 경우 에러
    if ((!pictureId&&pictureUrl)||(pictureId&&!pictureUrl)) 
        return res.send(errResponse(baseResponse.PICTURE_ID_OR_URL_EMPTY));

    // pictureId, pictureUrl 없으면 null 부여
    if ((!pictureId) && (!pictureUrl)) {
        pictureId = null
        pictureUrl = null
    }
        

    // DB에 회원정보 등록
    const signUpResponse = await userService.createUser(
        mobile,
        nickname,
        pictureId,
        pictureUrl
    );

    return res.send(signUpResponse);
};

/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] app/login
 */

 exports.login = async function (req, res) {

    /**
     * Body: mobile, verificationCode, villageIdx
     */

    const { mobile, verificationCode, villageIdx } = req.body;

    // 휴대폰 번호 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // 인증번호 형식적 검증
    const verificationCodeVerification = inputverifier.verifyCode(verificationCode);
    if (!verificationCodeVerification.isValid) return res.send(errResponse(verificationCodeVerification.errorMessage));

    // villageIdx 형식적 검증
    const villageIdxVerification = inputverifier.verifyVillageIdx(villageIdx);
    if (!villageIdxVerification.isValid) return res.send(errResponse(villageIdxVerification.errorMessage));

    // 인증번호 일치여부 확인
    if (verificationCode != "1234") return res.send(errResponse(baseResponse.VERIFICATION_CODE_NOT_MATCH))

    // userIdx 구해오기
    const userIdx = await userProvider.getUserIdx(mobile);

    // userLocationIdx 가져오기
    const checkCurrentLocationUserIdxResponse = await locationProvider.checkCurrentLocationUserIdx(userIdx)
    if (checkCurrentLocationUserIdxResponse.length < 1) { // 기존에 등록된게 없으면 새로 등록
        await locationService.createUserLocation(userIdx, villageIdx)
    } else {
        const userLocationIdx = checkCurrentLocationUserIdxResponse[0].userLocationIdx
        // 기존의 userLocation를 새로 받은 villageIdx로 교체하기
        await locationService.changeCurrentVillage(userIdx, userLocationIdx, villageIdx)
    }
    
    // userLocation 명단 가져오기
    const userLocations = await userProvider.getUserLocations(userIdx)

    // jwt로 바꾸고 저장하기
    let token = await jwt.sign(
        {
            userIdx: userIdx
        }, // 토큰의 내용(payload)
        process.env.JWT_SECRET_KEY, // 비밀키
        {
            expiresIn: "365d",
            subject: "userInfo",
        } // 유효 기간 365일
        );

    const loginResult = { "jwt": token, "userLocations": userLocations }

    return res.send(response(baseResponse.SUCCESS, loginResult));
};

/**
 * API No. 5
 * API Name : 회원 탈퇴 API
 * [PATCH] app/users
 */
 exports.patchUser = async function (req, res) {

    /*
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // DB에 회원상태 삭제로
    const deleteUserResponse = await userService.deleteUser(userIdx);
    return res.send(deleteUserResponse);
};

/**
 * API No. 6
 * API Name : 나의 당근 메인페이지 API
 * [GET] app/users
 */
 exports.getUser = async function (req, res) {

    /*
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    // DB에 회원상태 삭제로
    const retrieveUserResponse = await userProvider.retrieveUser(userIdx);
    return res.send(retrieveUserResponse);
};

/**
 * API No. 10
 * API Name : 자동 로그인 API
 * [POST] app/auto-login
 */

 exports.autoLogin = async function (req, res) {

    /**
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    const getUserLocationsResponse = await userProvider.getUserLocations(userIdx);

    return res.send(response(baseResponse.SUCCESS, getUserLocationsResponse));
};

/**
 * API No. 16
 * API Name : 판매 중인 물품 목록 조회 API
 * [GET] /app/users/selling-items
 */

 exports.getSellingItemList = async function (req, res) {

    /**
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    const getSellingItemListResponse = await userProvider.retrieveSellingItem(userIdx);

    return res.send(getSellingItemListResponse);
};

/**
 * API No. 19
 * API Name : 판매내역 조회 API
 * [GET] /app/users/sold-items
 */

 exports.getSoldItemList = async function (req, res) {

    /**
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    const getSoldItemListResponse = await userProvider.retrieveSoldItem(userIdx);

    return res.send(getSoldItemListResponse);
};

/**
 * API No. 20
 * API Name : 구매 내역 조회 API
 * [GET] /app/users/sold-items
 */

 exports.getPurchasedItemList = async function (req, res) {

    /**
     * header: jwt token
     */

    const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const idxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!idxVerification.isValid) return res.send(errResponse(idxVerification.errorMessage));

    const getPurchasedItemListResponse = await userProvider.retrievePurchasedItem(userIdx);

    return res.send(getPurchasedItemListResponse);
};

/**
 * API No. 21
 * API Name : 프로필 조회 API (임시)
 * [GET] /app/users/profiles/:userIdx
 */

 exports.getProfile = async function (req, res) {

    /**
     * path variable: targetIdx
     * header: jwt token
     */

    const targetIdx = req.params.targetIdx;
    const userIdx = req.verifiedToken.userIdx;

    //userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // targetIdx 형식적 검증
    const targetIdxVerification = inputverifier.verifyUserIdxNotFromJwt(targetIdx);
    if (!targetIdxVerification.isValid) return res.send(errResponse(targetIdxVerification.errorMessage));

    const getProfileResponse = await userProvider.retrieveUserProfile(userIdx, targetIdx);

    return res.send(getProfileResponse);
};