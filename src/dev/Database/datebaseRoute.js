module.exports = function(app){
    const database = require('./databaseController');

    // 1. 개발자용 DB 조회 API
    app.get('/dev/database', database.getAll);

};
