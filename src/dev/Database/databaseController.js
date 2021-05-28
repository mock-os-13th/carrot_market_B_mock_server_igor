const databaseProvider = require("../../dev/Database/databaseProvider");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

/**
 * API No. 21
 * API Name : 데이터 베이스 전체 조회 API
 * [GET] /dev/datebase
 */
 exports.getAll = async function (req, res) {

    /**
     * Query String: tableName
     */

     const tableName = req.query.tableName;

     const getAllResponse = await databaseProvider.retrieveAllData(tableName);

     return res.send(getAllResponse);

};