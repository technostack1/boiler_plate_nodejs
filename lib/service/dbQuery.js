const db = require('./../../config/dbConnection')
const validation = require('./validation')

exports.execute = execute = (query, params) => {

  return new Promise((resolve, reject) => {
    db.con.query(query, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  })
}

exports.insert = (table, dbColumns, dbValues, params) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }
    const query = `INSERT INTO ${table} (${dbColumns}) VALUES (${dbValues})`;
    execute(query, params)
      .then(resp => {
        return resolve(resp);
      }).catch(err => {
        return reject(err);
      });
  });
}
exports.selectAll = (table) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }

    const query = `SELECT * from ${table}`;
    execute(query)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.selectAllWithCondition = (table, condition, params) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }

    if (validation.isEmpty(condition)) {
      return reject('Invalid condition');
    }

    const query = `SELECT * from ${table} where ${condition}`;
    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.join = (table1, table2, columns, joinCondition, where, params) => {

  return new Promise((resolve, reject) => {
    let whereClause = '';
    if (where !== 0) {
      whereClause = ` WHERE ${where} `;
    }
    const query = `SELECT ${columns} from ${table1} 
                 INNER JOIN ${table2} ON
                 ${joinCondition}  ${whereClause}`;
    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  });

}


exports.leftJoinQuery = (table1, table2, columns, joinCondition, where, params) => {

  return new Promise((resolve, reject) => {
    let whereClause = '';
    if (where !== 0) {
      whereClause = ` WHERE ${where} `;
    }
    const query = `SELECT ${columns} from ${table1} 
    LEFT JOIN ${table2} ON
    ${joinCondition}  ${whereClause}`;

    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  });

}

exports.selectColumns = (table, columns, params, condition) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }

    if (validation.isEmpty(columns)) {
      return reject('Invalid condition');
    }

    if (validation.isEmpty(condition)) {
      return reject('Invalid condition');
    }

    const query = `SELECT ${columns} from ${table} where ${condition}`;
    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.count = (table) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }

    const query = `SELECT COUNT(id) As count from ${table}`;
    execute(query, '')
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.countById = (table, params, condition) => {

  return new Promise((resolve, reject) => {

    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }

    const query = `SELECT COUNT(id) As count from ${table} WHERE ${condition}`;
    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.deleteTempUser = (id) => {

  return new Promise((resolve, reject) => {
    if (!validation.validateDigits(id)) {
      return reject('Invalid Id');
    }
    const query = `DELETE from tbl_verification_tmp where id = ${id} LIMIT 1`;
    execute(query)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.deleteOtp = (id) => {
  return new Promise((resolve, reject) => {
    if (!validation.validateDigits(id)) {
      return reject('Invalid Id');
    }
    const query = `DELETE from tbl_otp where id = ${id} LIMIT 1`;
    execute(query)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  });
}


exports.deleteWithCondition = (table, condition, params) => {

  return new Promise((resolve, reject) => {
    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name'); ``
    }
    if (table !== 'tbl_favourite' && table !== 'tbl_tmp_merchants') {
      return reject('Access denied');
    }

    if (validation.isEmpty(condition)) {
      return reject('Invalid condition');
    }
    const query = `DELETE from ${table} where ${condition}`;
    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.deleteByCondition = (table, condition) => {

  return new Promise((resolve, reject) => {
    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }
    if (validation.isEmpty(condition)) {
      return reject('Invalid condition');
    }
    const query = `DELETE from ${table} where ${condition}`;
    execute(query)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};

exports.updateColumns = (table, updateColumns, params, condition) => {
  return new Promise((resolve, reject) => {
    let columns = ``;
    if (validation.isEmpty(table)) {
      return reject('Invalid Table Name');
    }
    if (validation.isEmpty(condition)) {
      return reject('Invalid condition');
    }
    const query = `UPDATE ${table} SET ${updateColumns}  WHERE ${condition}`;

    execute(query, params)
      .then(resp => {
        resolve(resp);
      }).catch(err => {
        reject(err);
      });
  })
};
