
const db = require('../../lib/service/dbQuery');


exports.logError = logError = (userId, moduleName,errorMsg) => {
    const dbColumns = `user_id, module,error_msg`;
    const queryParams = [userId, moduleName,errorMsg];
    const queryValues = '?, ?,?';
    db.insert('error_log', dbColumns, queryValues, queryParams)
   .then(resp=>{
        return true;
   })
   .catch(error=>{
    return false;
   });
}



