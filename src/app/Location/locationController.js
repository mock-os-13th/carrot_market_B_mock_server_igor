const locationProvider = require("../../app/Location/locationProvider");
const likeService = require("../../app/Location/locationService");
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