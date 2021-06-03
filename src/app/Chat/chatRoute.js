module.exports = function(app){
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 37. 채팅으로 거래하기 API
    app.get('/app/chats/rooms-by-item', jwtMiddleware, chat.getRoomByItem);

};
