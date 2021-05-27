module.exports = function(app){
    const deal = require('./dealController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 13. 판매완료 API
    app.post('/app/deals', jwtMiddleware, deal.postDeal);
        // 힌트! deals 다음에 이런 식으로 :itemIdx로 path variable를 놓았는데
        // /app/deals/buyer 식으로 다른 path를 지정하면
        // buyer를 path variable로 인식해버린다...

    // 14. 구매자 등록 API
    app.post('/app/deals/buyers', jwtMiddleware, deal.postBuyer);

    // 15. 구매자 선택 목록 조회 API
  //  app.get('/app/deals/buyers', jwtMiddleware, deal.getBuyerToBeList)
};
