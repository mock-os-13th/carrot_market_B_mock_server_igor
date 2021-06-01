module.exports = function(app){
    const location = require('./locationController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 테스트 API: 카카오맵 API를 통해서 좌표를 행정동으로 변환
    app.get('/app/locations', jwtMiddleware, location.test1);

    // 26. 동네 검색 API
    app.get('/app/locations/search', location.searchVillage);

    // 27. 내 동네 설정 페이지 API
    app.get('/app/locations/my-villages', jwtMiddleware, location.getMyVillages)
    
    // 28. 내 동네 설정 API
    app.post('/app/locations/my-villages', jwtMiddleware, location.postMyVillage)

    // 29. 내 동네 삭제 API
    app.patch('/app/locations/my-villages', jwtMiddleware, location.patchMyVillage)

    // 30. 현재 선택한 내 동네 변경 API
    app.patch('/app/locations/current-village', jwtMiddleware, location.patchCurrentVillage)

    // 31. 동네 인증하기 페이지 API
    app.get('/app/locations/authentification', jwtMiddleware, location.getCurrentLocation)

    // 32. 동네 인증하기 API
    app.post('/app/locations/authentification', jwtMiddleware, location.postAuthenticatedLocation)

    // 33. 동네 범위 변경 API
    app.patch('/app/locations/range-level', jwtMiddleware, location.patchRangeLevel)

    // 34. 현재 위치로 동네 검색 API
    app.get('/app/locations/search-gps', location.searchVillageByGps);
};