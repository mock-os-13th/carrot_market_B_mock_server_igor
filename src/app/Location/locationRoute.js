module.exports = function(app){
    const location = require('./locationController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 테스트 API: 카카오맵 API를 통해서 좌표를 행정동으로 변환
    app.get('/app/location', jwtMiddleware, location.test1);

    // 26. 동네 검색 API
    app.get('/app/location/search', location.searchVillage);

    // 27. 
    

};