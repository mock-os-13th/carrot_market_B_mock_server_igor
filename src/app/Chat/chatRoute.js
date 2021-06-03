module.exports = function(app){
    const chat = require('./chatController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 37. 채팅방 열기 API
    app.get('/app/chats/messages', jwtMiddleware, chat.getMessages);

    // 38. 채팅 보내기 API
    app.post('/app/chats/messages',  jwtMiddleware, chat.postMessage)

    // 39. 채팅목록 보기 API
    app.get('/app/chats/rooms', jwtMiddleware, chat.getRoomList)

};
