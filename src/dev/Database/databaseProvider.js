const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const databaseDao = require("./databaseDao");

// 한 Table 전체 조회
exports.retrieveAllData = async function (tableName) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const retrieveAllDataResult = await databaseDao.selectAll(connection, tableName);
        connection.release();

        return response(baseResponse.SUCCESS, retrieveAllDataResult);
    } catch (err) {
        logger.error(`App - retrieveAllData Provide error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    
  
    
  };
