module.exports = function(app){
    const deal = require('./dealController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 13. 판매완료 API
    app.post('/app/deals/:itemIdx', jwtMiddleware, deal.postDeal);
};
