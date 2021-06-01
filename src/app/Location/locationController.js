const locationProvider = require("../../app/Location/locationProvider");
const locationService = require("../../app/Location/locationService");
const baseResponse = require("../../../config/baseResponseStatus");
const inputverifier = require("../../../config/inputVerifier");
const {response, errResponse} = require("../../../config/response");

const request = require('request-promise-native')

const {emit} = require("nodemon");


exports.test1 = async function (req, res) {

    const x = req.query.x
    const y = req.query.y

    // 좌표 검증하기

    // 카카오맵 API 파라미터 입력
    const kakaoMapOptions = {
    uri: "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json",
    qs:{
        x: x,
        y: y
    },
    headers: {
        'Authorization': 'KakaoAK 2780c91e78f580017296a2c3a88b251e'
    },
    };

    // 카카오맵 실행
    const kakaoMapresult = await request(kakaoMapOptions)
    const parsedKakaoMapresult = JSON.parse(kakaoMapresult)
    const userAuthorizedDong = parsedKakaoMapresult.documents[1].region_3depth_name
    return res.send(userAuthorizedDong);
    

};

/**
 * API No. 26
 * API Name : 동네 검색 API
 * [GET] /app/locations/search
*/

exports.searchVillage = async function (req, res) {

    const searchWord = req.query.searchWord;

    // 검색어 검증
    const searchWordVerification = inputverifier.verifyVillageSearchWord(searchWord)
    if (!searchWordVerification.isValid) return res.send(errResponse(searchWordVerification.errorMessage));

    // 검색 내역 가져오기
    const retrieveLocationSearchListResponse = await locationProvider.retrieveLocationSearchList(searchWord);

    return res.send(retrieveLocationSearchListResponse);

};

/**
 * API No. 27
 * API Name : 내 동네 설정 페이지 API
 * [GET] app/locations/my-villages
*/

exports.getMyVillages = async function (req, res) {

     /*
     * header: jwt token
     */

     const userIdx = req.verifiedToken.userIdx;

    // userIdx 형식적 검증
    const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
    if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // 내 동네 가져오기
    const retrieveMyVillagesResponse = await locationProvider.retrieveMyVillages(userIdx);

    return res.send(retrieveMyVillagesResponse);

};

/**
 * API No. 28
 * API Name : 내 동네 설정 페이지 API
 * [POST] /app/locations/my-villages
*/

exports.postMyVillage = async function (req, res) {

    /*
    * header: jwt token
    * body: villageIdx, rangeLevel
    */

    const userIdx = req.verifiedToken.userIdx;
    const villageIdx = req.body.villageIdx;
    const rangeLevel = req.body.rangeLevel

   // userIdx 형식적 검증
   const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
   if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // villageIdx 형식적 검증
    const villageIdxVerification = inputverifier.verifyVillageIdx(villageIdx);
    if (!villageIdxVerification.isValid) return res.send(errResponse(villageIdxVerification.errorMessage));

    // rangeLevel 형식적 검증
    const rangeLevelVerification = inputverifier.verifyRangeLevel(rangeLevel);
    if (!rangeLevelVerification.isValid) return res.send(errResponse(rangeLevelVerification.errorMessage));

   // 내 동네 설정하기
   const createUserLocationResponse = await locationService.createUserLocation(userIdx, villageIdx, rangeLevel);

   return res.send(createUserLocationResponse);

};

/**
 * API No. 29
 * API Name : 내 동네 삭제 API
 * [PATCH] /app/locations/my-villages
*/

exports.patchMyVillage = async function (req, res) {

    /*
    * header: jwt token
    * body: userLocationIdx
    */

    const userIdx = req.verifiedToken.userIdx;
    const userLocationIdx = req.body.userLocationIdx;

   // userIdx 형식적 검증
   const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
   if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // userLocationIdx 형식적 검증
    const userLocationIdxVerification = inputverifier.verifyUserLocationIdx(userLocationIdx);
    if (!userLocationIdxVerification.isValid) return res.send(errResponse(userLocationIdxVerification.errorMessage));

   // 내 동네 삭제하기
   const deleteUserLocationResponse = await locationService.deleteUserLocation(userIdx, userLocationIdx);

   return res.send(deleteUserLocationResponse);

};

/**
 * API No. 30
 * API Name : 현재 선택한 내 동네 변경 API
 * [PATCH] /app/locations/current-village
*/

exports.patchCurrentVillage = async function (req, res) {

    /*
    * header: jwt token
    * body: userLocationIdx
    */

    const userIdx = req.verifiedToken.userIdx;
    const userLocationIdx = req.body.userLocationIdx;

   // userIdx 형식적 검증
   const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
   if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // userLocationIdx 형식적 검증
    const userLocationIdxVerification = inputverifier.verifyUserLocationIdx(userLocationIdx);
    if (!userLocationIdxVerification.isValid) return res.send(errResponse(userLocationIdxVerification.errorMessage));

   // 현재 선택한 내 동네 바꾸기
   const updateCurrentVillageResponse = await locationService.updateCurrentVillage(userIdx, userLocationIdx);

   return res.send(updateCurrentVillageResponse);

};

/**
 * API No. 31
 * API Name : 동네 인증하기 페이지 API
 * [GET] /app/locations/authentification
*/

exports.getCurrentLocation = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    

    // userIdx 형식적 검증  
   const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
   if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // 좌표 검증하기
    const coordVerification = inputverifier.verifyCoord(latitude, longitude);
   if (!coordVerification.isValid) return res.send(errResponse(coordVerification.errorMessage));

    // 카카오맵 API 파라미터 입력
    const kakaoMapOptions = {
    uri: "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json",
    qs:{
        x: longitude,
        y: latitude
    },
    headers: {
        'Authorization': 'KakaoAK 2780c91e78f580017296a2c3a88b251e'
    },
    };

    // 카카오맵 API 사용
    const kakaoMapresult = await request(kakaoMapOptions)
    const parsedKakaoMapresult = JSON.parse(kakaoMapresult)
    const userLocationDongByCoord = parsedKakaoMapresult.documents[1].region_3depth_name
    
    // 좌표를 통한 현재 위치, 사용자가 저장한 현재 위치 가져오기
    const retrieveCoordAndCurrentLocationsResponse = await locationProvider.retrieveCoordAndCurrentLocations(userIdx, userLocationDongByCoord);

    return res.send(retrieveCoordAndCurrentLocationsResponse);
};

/**
 * API No. 32
 * API Name : 동네 인증하기 API
 * [POST] /app/locations/authentification
*/

exports.postAuthenticatedLocation = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;
    const latitude = req.body.latitude
    const longitude = req.body.longitude
    const villageIdx = req.body.villageIdx
    

    // userIdx 형식적 검증  
   const userIdxVerification = inputverifier.verifyUserIdx(userIdx);
   if (!userIdxVerification.isValid) return res.send(errResponse(userIdxVerification.errorMessage));

    // 좌표 검증하기
    const coordVerification = inputverifier.verifyCoord(latitude, longitude);
   if (!coordVerification.isValid) return res.send(errResponse(coordVerification.errorMessage));

   // villageIdx 형식적 검증
   const villageIdxVerification = inputverifier.verifyVillageIdx(villageIdx);
   if (!villageIdxVerification.isValid) return res.send(errResponse(villageIdxVerification.errorMessage));

    // 카카오맵 API 파라미터 입력
    const kakaoMapOptions = {
    uri: "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json",
    qs:{
        x: longitude,
        y: latitude
    },
    headers: {
        'Authorization': 'KakaoAK 2780c91e78f580017296a2c3a88b251e'
    },
    };

    // 카카오맵 API 사용
    const kakaoMapresult = await request(kakaoMapOptions)
    const parsedKakaoMapresult = JSON.parse(kakaoMapresult)
    const userLocationDongByCoord = parsedKakaoMapresult.documents[1].region_3depth_name
    
    // 인증 받은 위치 저장
    const createAuthorizedUserLocationResponse = await locationService.createAuthorizedUserLocation(userIdx, villageIdx, userLocationDongByCoord);

    return res.send(createAuthorizedUserLocationResponse);
};
