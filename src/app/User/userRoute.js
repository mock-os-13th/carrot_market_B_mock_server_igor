module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1. 휴대폰 인증번호 받기 API (임시)
    app.get('/app/users/mobile-check', user.getMobileCheck);

    // 2. 회원가입 휴대폰 인증번호 확인 API (임시)
    app.post('/app/users/mobile-check-signup', user.postMobileCheckSignUp);

    // 3. 회원가입 API (닉네임 등록)
    app.post('/app/users', user.postUser);

    // 4. 로그인 API
    app.post('/app/login', user.login)

};
