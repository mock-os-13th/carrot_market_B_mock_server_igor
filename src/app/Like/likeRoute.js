module.exports = function(app){
    const like = require('./likeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 11. 관심상품 등록/취소 API
    app.post('/app/likes/items/:itemIdx', jwtMiddleware, like.postItemLike);

};
