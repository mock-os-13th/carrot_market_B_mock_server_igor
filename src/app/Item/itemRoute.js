module.exports = function(app){
    const item = require('./itemController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 7. 물품 등록 API (사진 미구현)
    app.post('/app/items', jwtMiddleware, item.postItem);

    // 8. 물품 상세 조회 API (일부 더미 데이터)
    app.get('/app/items/:itemIdx', jwtMiddleware, item.getItem)

    // 9. 물품 목록 조회 API (홈화면)
    app.get('/app/items', item.getItemList)

    // 35. 상품 검색 API
    app.get('/app/item-search', item.getFilteredItemList)

};