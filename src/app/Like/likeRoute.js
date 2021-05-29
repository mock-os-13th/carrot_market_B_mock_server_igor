module.exports = function(app){
    const like = require('./likeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 11. 관심상품 등록/취소 API
    app.post('/app/likes/items/:itemIdx', jwtMiddleware, like.postItemLike);

    // 12. 관심상품 목록 조회 API
    app.get('/app/likes/items', jwtMiddleware, like.getItemLikes);

    // 23. 판매자 모아보기 등록/취소 API
    app.post('/app/likes/sellers/:sellerIdx', jwtMiddleware, like.postUserLike)

    // 24. 판매자 모아보기 물품 조회 API
    app.get('/app/likes/sellers', jwtMiddleware, like.getSellerLikeItems);
};
