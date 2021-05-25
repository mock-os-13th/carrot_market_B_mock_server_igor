module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1. 휴대폰 인증번호 받기 API (임시)
    app.get('/app/users/mobile-check', user.getMobileCheck);

};