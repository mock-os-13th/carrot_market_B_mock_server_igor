async function selectAll(connection, tableName) {
    const selectAllQuery = `
                  SELECT *
                  FROM ${tableName}
                  `;
    const [dataRows] = await connection.query(selectAllQuery, tableName);
    return dataRows;
  }

  module.exports = {
    selectAll
  };