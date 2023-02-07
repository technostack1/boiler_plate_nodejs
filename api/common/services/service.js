/*
** Load Node Modules **
*/
const express = require('express');
const app = express();
const sanitizer = require('sanitize')();
const responseHandler = require('../../../lib/service/responseHandler');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const mailService = require('../../../lib/service/mail.service');
const passwordValidator = require('password-validator');
const md5 = require('md5');

app.use(require('sanitize').middleware);

/* ## Database Library */
const db = require('../../../config/dbConnection')

const config = require('../../../config/environment/index')

const imagesUpload = require('../../../lib/imagesUpload');
//console.log('sql',sql.provider);
/** Services   */

/* ## Include libraries  */
const validation = require('../../../lib/service/validation');
const striptags = require('striptags');
const moment = require('moment');
const { result } = require('lodash');

/*
* Get single provider
*/

exports.adminFindById = (data) => {
  return new Promise(function (resolve, reject) {
    let id =  data.id ;
    let query = `Select * from users WHERE id = '${id}'  `;
    db.sequelize.query(query).then(([admin, metadata]) => {
      if(admin.length == 0){
        reject("invalid token");
        } else {
          let resp = {}
            resp = admin[0];
            delete resp.password;
          resolve(resp);
        }
      })
      .catch((error) => {
        reject({ message: `Internal Server Error ${error}`, code: 500 });
      });
  });
};


exports.getChartData = (chartName) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT * FROM uiitem WHERE primaryObject =   '${chartName}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.themeIntersectionJoinData = (resp,tableName,id,x) => {
  return new Promise(function(resolve, reject) {
      if(x == 0){
        resolve(resp);

      }
      let query = `SELECT  * FROM ${tableName} WHERE id = ${id} `;
      db.sequelize.query(query).then(([results, metadata]) => {
        if(results.length > 0){
          resp.childName = (typeof results === undefined )? null : results[0].name;
          resp.shortDescription = (typeof results[0].shortDescription === undefined )? null : results[0].shortDescription;
          resp.longDescription = (typeof results[0].longDescription === undefined )? null : results[0].longDescription;
            Object.keys(results[0]).forEach((key,i)=>{
              resp[key] = results[0][key];
            })
    
        }else{

          resp.childName = null;
          resp.shortDescription = null;
          resp.longDescription = null;
        }
        resolve(resp);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


function smallLetter(string) {
//	console.log('string',string);
    return string.charAt(0).toLowerCase() + string.slice(1);
}

exports.getSingle = (resource,id,orderBy,fk) => {
  return new Promise(function(resolve, reject) {
    queryBuilder(resource)
    .then(resp =>{

      let where  = "";
      if(fk != ""){
 //     where  = `WHERE ${fk} = ${user.id} `;
      }
  
       let query = resp.query+ ' where z.id = '+id;
       if(orderBy != null){
        query = `${query} order By z.${orderBy} DESC`;
       }
   
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
    })
    .catch(error =>{
      reject(error);
  
    });
  
    })
    .catch(error =>{
      reject(error);
  
    })
  
      
    })
  
}

/*
* Get all 
*/
exports.getAll = (resource,orderBy,query,user,fk) => {
  console.log("... in getAll .......");
  return new Promise(function(resolve, reject) {
  queryBuilder(resource)
  .then(resp =>{
    let where  = "";
    if(fk != ""){
      where  = `WHERE ${fk} = ${user.id} `;
    }

    let respQuery = `${resp.query}  ${where} `;
    let queryParams = '';
    let x = 0;
    let sortBy = "DESC";
    
    if(Object.keys(query).length !== 0 && query.constructor === Object){
      Object.keys(query).forEach((key,i)=>{
        
        if(key != "orderBy"  && key != "sortBy" && key != "months" && key != "grouping" && key != 'children' && key != 'limit' && key != 'q' ){
          if(key === "month"){
            queryParams += (x == 0)? `WHERE month  = '${query[key]}' ` : `AND month  = '${query[key]}' `;
            x++;

          }

          else if(query[key] == "" || query[key] == "null"){
            queryParams += (x == 0)? `WHERE ${key} IS NULL ` : `AND  (z.${key} IS NULL OR ${key} = 'NULL'  OR ${key}= '' ) `;
            x++;
              
          }
          else{
            queryParams += (x == 0)? `WHERE ${key} = '${query[key]}' ` : `AND ${key} = '${query[key]}' `;
            x++;
  
          }
        }
        if(key == "sortBy" && query[key] != ""){
          sortBy = (query[key] == 'asc' || query[key] == 'ASC')? 'ASC' : 'DESC';
        }  

      })

    }
    if(queryParams != ""){
      respQuery = ` ${respQuery} ${queryParams}`;

    }
    if(orderBy != null){
      respQuery = `${respQuery} order By z.${orderBy} ${sortBy}`;
    }

    if(typeof query.limit != "undefined"){
     // respQuery = `${respQuery} LIMIT  ${query.limit} `;

    }

    /*
    if(resource === "remainder"){
      respQuery = `SELECT remainder_time AS created_date,id,remainder_name,profileId  FROM remainder WHERE profileId = '${query.profileId}'`;
    }
    */
      console.log("respQuery",respQuery);
    db.sequelize.query(respQuery).then(([results, metadata]) => {
      console.log("results length",results.length);
      console.log(" before results data",results);
      if(results.length > 0 && resource === "remainder"){
        results.forEach((rest,i) =>{

          results[i].remainder_time = tConvert(rest.remainder_time);

        });
          console.log("after result ",results);
        resolve(results);


      }
      else{
        resolve(results);

      }

  })
  .catch(error =>{
    console.log('error1',error);

    reject(error);

  });

  })
  .catch(error =>{
    console.log('error2');
    reject(error);

  })

    
  })
  
}




function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}



function queryBuilder(table){
  return new Promise(function(resolve, reject) {
    let excludedFields = ['id','password','hash'];
    let joinsTable = [];
    let dbType = config.dbConfig.dbType;
    let mainQuery = `DESCRIBE ${table}`;
     let field = 'Field';
    db.sequelize.query(mainQuery).then(result=>{
     // console.log('query builder');
        let dobuleJoin = false;
         if(result[0].length > 0){
          result[0].forEach((element,j) => {
              if(!excludedFields.includes(element[field])){
                  if(element[field].indexOf('Id') != '-1' ){
                      let splitString =  element[field].split("Id");
 //                     console.log("splitString",splitString);
                          joinsTable.push({'joinKey' : element[field] , 'table':splitString[0]}); 
                  }
              }
           });
           let sql = "";
           let words = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n'];
           let selectFields = '';
           let joinQuery = '';
            if(joinsTable.length > 50000000000000){
                   selectFields = '';
                   joinQuery = '';
                   let dobuleJoinTable = [];
                   let doubleCheck = false;
                  joinsTable.forEach((element,i) => {
                    doubleCheck = false;
                    let j = words[i];

                      if(dobuleJoin){
                        if(dobuleJoinTable.length > 0 && dobuleJoinTable.includes(element.table)){
                          doubleCheck = true;
                          selectFields += ` , ${j}.name   as ${element.joinKey}Name  `;

                        }else{
                          dobuleJoinTable.push(element.table);

                        }

                      }
                      if(!doubleCheck){
                        selectFields += ` , ${j}.name as ${element.table}Name  `;
  
                      }
                      joinQuery += ` LEFT JOIN  ${element.table} as ${j}
                      ON z.${element.joinKey} = ${j}.id  `;

                  });
            }else{
              sql = `Select z.* from ${table} as z`;
            }
  
            sql = `Select z.* ${selectFields} from ${table} as z`;
            let finalQuery =  sql+joinQuery;
            resolve({query:finalQuery})
          }
          })
          .catch(error =>{
            console.log('error block 0')
              reject(error);
            //return responseHandler.resHandler(false, {}, 'Internal Server Error ', res, 500);

          })

  })


}


/*
* Create 
*/
exports.create = (data,resource,user) => {
 // data.idOrganization = user.idOrganization;
  //data.idUserCreatedBy = user.idUserCreatedBy;
  console.log("here we goo..");
  return new Promise(function(resolve, reject) {
   let dataKeys = ""; 
   let dataValues = ""; 
   Object.keys(data.value).forEach((key,i)=>{
      
    dataKeys  += (i < Object.keys(data.value).length-1)? `${key}`+','   : `${key}` ;
    let s = data.value[key];
    if(typeof s == "string"){
      s =  s.replace(/'/g, "");
      s =  s.replace(/`/g, "");

    }
    s = (s == 'undefined' || s == undefined)? '' : s;
    if(i < Object.keys(data.value).length-1){
      dataValues += `'${s}',`;
    }else{
      dataValues += `'${s}'`;

    }

   });
   
      let query = "INSERT INTO "+resource+" ("+dataKeys+" ) VALUES ("+dataValues+") ";
     // console.log("query",query);
      db.sequelize.query(query,{type: db.sequelize.QueryTypes.INSERT}).then(function (data) 
        { db.sequelize.query('SELECT @@IDENTITY', {type: db.sequelize.QueryTypes.SELECT}) .then(id =>{
          console.log("last inserted id",id[0][''] )
          resolve(id[0]['']);
        })         
        
    })
  .catch(err =>{
    console.log("bbb",err);
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }  

  });
  });
}


/*
* Edit 
*/

exports.edit = (data,resource,id,req,fk) => {
  return new Promise(function(resolve, reject) {
   // console.log('data',data.value);
   let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

   let dataKeyValue = ""; 
   Object.keys(data.value).forEach((key,i)=>{
    let s = data.value[key];
    if(typeof s == "string"){
      s =  s.replace(/'/g, "\\'");
    }
    if(key === 'lastUpdateDate'){
         s = date;
      }
      if(key === 'idUserLastUpdateBy'){
            s = req.user.id;
      }
      if(key === 'idOrganization'){
      	s = req.user.idOrganization;
      }
      if(key != "createdDate" && key != "idUserCreatedBy"){

    if(i < Object.keys(data.value).length-1){
      if(s != undefined){
        dataKeyValue += ` ${key}  = '${s}',`;

      }

    }else{
      if(s != undefined){
        dataKeyValue += ` ${key}  = '${s}'`;

      }


    }
  }
   });
     if(dataKeyValue[dataKeyValue.length-1] == ","){
      dataKeyValue = dataKeyValue.replace(/,\s*$/, ""); 
     }

     let wheres = "";
      let query = "UPDATE "+resource+" SET "+dataKeyValue+" WHERE  id =  '"+id+"'   ";
      if(fk != ""){
        wheres  = `AND ${fk} = ${user.id} `;
      }
      query = query+wheres;
//      console.log("query",query);
      db.sequelize.query(query).then(([results, metadata]) => {
  
        resolve(results);
  })
  .catch(error =>{
    console.log("edit eror");
    reject(error);

  });
  });
}



/*
* softDelete 
*/
exports.softDelete = (resource,id) => {
  return new Promise(function(resolve, reject) {
    let query = `Update ${resource} set deleted = 1 WHERE id =  ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


/*
* softDelete 
*/
exports.delete = (resource,id) => {
  return new Promise(function(resolve, reject) {
    let query = `Delete from  ${resource} WHERE id = ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.themeIntersection = (orderBy,query,id) => {
  return new Promise(function(resolve, reject) {
    let respQuery = "SELECT  t.name as themeName , t.shortDescription as sd,t.longDescription as ld ,i.* , i.id as themeIntersectionId FROM  theme AS t   LEFT JOIN themeIntersection AS i  ON cast(t.id as varchar(40)) = i.idTheme ";
    if(id != 0){
      respQuery +=  " WHERE t.id = '"+id+"'"; 
    }else{
      let idtheme = (typeof query.idtheme == 'undefined')? null : striptags(decodeURI(query.idtheme.trim()));
      let tablename = (typeof query.tablename == 'undefined')? null : striptags(decodeURI(query.tablename.trim()));
      let idparent = (typeof query.idparent == 'undefined')? null : striptags(decodeURI(query.idparent.trim()));
      if(idparent != null && tablename != null){
        respQuery = respQuery+" WHERE i.tableName = '"+tablename+"' AND i.idParent = '"+idparent+"'  ";
      }
  
      else if(idtheme != null && tablename != null){
        respQuery = respQuery+" WHERE i.idTheme = "+idtheme+" AND i.tableName = '"+tablename+"' ";
        if(idparent != null){
          respQuery = respQuery+"  AND i.idParent = '"+idparent+"' ";
        }
      }
      else if(idtheme != null ){
        respQuery = respQuery+" WHERE i.idTheme = '"+idtheme+"'  ";
      }
      else if(tablename != null){
        respQuery = respQuery+" WHERE  i.tableName = '"+tablename+"' ";
      }
      else if(idparent != null){
        respQuery = respQuery+" WHERE  i.idParent = '"+idparent+"' ";
      }
  
           
    }
       console.log('respQuery',respQuery);
    let queryParams = '';
    let x = 0;
    let sortBy = "DESC";
    if(Object.keys(query).length !== 0 && query.constructor === Object){
    //  console.log('query not null',query);       
      Object.keys(query).forEach((key,i)=>{
        if(key != "orderBy" && query[key] != "" && key != "sortBy" && key != "landscape" && key != "grouping"  ){
       //   queryParams += (x == 0)? `WHERE z.${key} = '${query[key]}' ` : `AND z.${key} = '${query[key]}' `;
          x++;
        }
        if(key == "sortBy" && query[key] != ""){
          sortBy = (query[key] == 'asc' || query[key] == 'ASC')? 'ASC' : 'DESC';
        }  

      })

    }
    //console.log('queryParams',queryParams);
    if(queryParams != ""){
      respQuery = ` ${respQuery} ${queryParams}`;

    }
    if(orderBy != null){
      respQuery = `${respQuery} order By z.${orderBy} ${sortBy}`;
    }
   // console.log('respQuery',respQuery);

    db.sequelize.query(respQuery).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    console.log('error1');

    reject(error);

  });


    
  })
  
}




exports.metricData = (objectName) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT  * from metric  WHERE object = '${objectName}' `;
      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


exports.customerTokenUpdate = (req,token) => {
  return new Promise(function(resolve, reject) {
    let query = `Update users set uuid = '${token}' WHERE id =  ${req.user.id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.customerPackageUpdate = (req,packageId) => {
  return new Promise(function(resolve, reject) {
    let query = `Update users set packageId = '${packageId}' WHERE id =  ${req.user.id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    console.log("error1",error);
    reject(error);

  });
  });
}

exports.metricScript = (query,type,readFromDb) => {
  return new Promise(function(resolve, reject) {
    if(readFromDb == 1){
      db.sequelize.query(query).then(([results, metadata]) => {
        results[0].value = results[0].value+type;
      resolve(results[0]);
})
.catch(error =>{
  reject(error);

});
    
    }else {
      query.value = query.value+type;
      resolve(query);
    }
  });
}


exports.globalSearch = (query) => {
  return new Promise(function(resolve, reject) {
      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


/*
* delete 
*/
exports.solutionrequirementmatrix = (id,regenerate) => {
  return new Promise(function(resolve, reject) {
     let query = `Select a.idInitiative , a.id as idSolution , b.id as idRequirement from solution as a , requirement as b 
                  WHERE a.idInitiative = ${id} AND b.idInitiative = ${id} `;
     let query2 = `Select idInitiative,idSolution, idRequirement from solutionRequirementMatrix WHERE 
        idInitiative = ${id} `;

        let generateDataSql = `INSERT INTO solutionRequirementMatrix (idInitiative,idRequirement,idSolution, idOrganization, idUserCreatedBy,createdDate)
        SELECT  a.idInitiative,a.id idRequirement, b.id idSolution, a.idOrganization, 1, NOW()
        FROM requirement a, solution b
        WHERE a.idInitiative= ${id} AND b.idInitiative=${id}
        `;
         
    if(regenerate == true || regenerate == 'true' ){
      let delSql = `delete from  solutionRequirementMatrix where idSolution in (select id from solution where idInitiative= ${id})`;
      db.sequelize.query(delSql).then(([results, metadata]) => {


        let generateDataSql = `INSERT INTO solutionRequirementMatrix (idRequirement,idSolution, idOrganization, idUserCreatedBy,createdDate)
        SELECT a.id idRequirement, b.id idSolution, a.idOrganization, 1, NOW()
        FROM requirement a, solution b
        WHERE a.idInitiative= ${id} AND b.idInitiative=${id}
        `;
        db.sequelize.query(generateDataSql).then(([results, metadata]) => {
          let query = `select * from solutionRequirementMatrix where idSolution in (select id from solution where idInitiative= ${id})
          `;
          db.sequelize.query(query).then(([results, metadata]) => {
              resolve(results);
          })
          .catch(error=>{

          });
    
        })
        .catch(error =>{

        })
      })
      .catch(error =>{
  
    });
    }
    /*
    else{
      let query = `select * from solutionRequirementMatrix where idSolution in (select id from solution where idInitiative= ${id})
      `;
      db.sequelize.query(query).then(([results, metadata]) => {
        if(results.length > 0){
          resolve(results);
  
        }else{
          let generateDataSql = `INSERT INTO solutionRequirementMatrix (idRequirement,idSolution, idOrganization, idUserCreatedBy,createdDate)
          SELECT a.id idRequirement, b.id idSolution, a.idOrganization, 1, NOW()
          FROM requirement a, solution b
          WHERE a.idInitiative= ${id} AND b.idInitiative=${id}
          `;
          db.sequelize.query(generateDataSql).then(([results, metadata]) => {
            let query = `select * from solutionRequirementMatrix where idSolution in (select id from solution where idInitiative= ${id})
            `;
            db.sequelize.query(query).then(([results, metadata]) => {
                resolve(results);
            })
            .catch(error=>{

            });
      
          })
          .catch(error =>{

          })

  
        }
    })
    .catch(error =>{
      reject(error);
  
    });
   
    }
    */
  
  });
}




exports.riskIntersection = (orderBy,query,id,tableName,idparent) => {
  return new Promise(function(resolve, reject) {
    let respQuery = "SELECT  t.name as registerName , t.shortDescription as sd,t.longDescription as ld ,i.* FROM  riskRegister AS t   LEFT JOIN riskRegisterIntersection AS i  ON t.id = i.idRiskRegister ";
    if(idparent != null && tableName != null){
      respQuery = respQuery+" WHERE i.tableName = '"+tableName+"' AND i.idParent = '"+idparent+"'  ";
    }

    else if(id != null && tableName != null){
      respQuery = respQuery+" WHERE t.id = "+id+" AND i.tableName = '"+tableName+"' ";
      if(idparent != null){
        respQuery = respQuery+"  AND i.idParent = '"+idparent+"' ";
      }
    }
    else if(id != null ){
      respQuery = respQuery+" WHERE t.id = "+id+"  ";
    }
    else if(tableName != null){
      respQuery = respQuery+" WHERE  i.tableName = '"+tableName+"' ";
    }
    else if(idparent != null){
      respQuery = respQuery+" WHERE  i.idParent = '"+idparent+"' ";
    }

    let queryParams = '';
    let x = 0;
    let sortBy = "DESC";
    /*
    if(Object.keys(query).length !== 0 && query.constructor === Object){
    //  console.log('query not null',query);       
      Object.keys(query).forEach((key,i)=>{
        if(key != "orderBy" && query[key] != "" && key != "sortBy" && key != "landscape" && key != "grouping"  ){
          queryParams += (x == 0)? `WHERE z.${key} = '${query[key]}' ` : `AND z.${key} = '${query[key]}' `;
          x++;
        }
        if(key == "sortBy" && query[key] != ""){
          sortBy = (query[key] == 'asc' || query[key] == 'ASC')? 'ASC' : 'DESC';
        }  
      })
    }
    */
    if(queryParams != ""){
      respQuery = ` ${respQuery} ${queryParams}`;

    }
    if(orderBy != null){
      respQuery = `${respQuery} order By z.${orderBy} ${sortBy}`;
    }
   // console.log('respQuery',respQuery);

    db.sequelize.query(respQuery).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    console.log('error1');

    reject(error);

  });


    
  })
  
}


/*
* Create 
*/
exports.registration = (data) => {
  return new Promise(function(resolve, reject) {
      let query = `INSERT INTO users
                  (
                    full_name,
                  email,
                  password,
                  hash,
                  status,
                  is_social_login

                  )
            VALUES ( 
              '${data.full_name}',
              '${data.email}',
              '${data.password}',
              '${data.hash}',
              '${data.status}',
              0

              )
              `;
      db.sequelize.query(query).then(([results, metadata]) => {
        let payload = {
          id: results,
          full_name: data.full_name,
          email: data.email,
          profileCount : 0,
          packageId : 0


      } 
      let values = {
        profile_name : data.full_name,profile_email : data.email , userId : results
      }
      //customPost(values,"profile");
      let parameter =  data.rememberMe == 1 ?  'jwtLifeInDays' : 'defaultJwtLifeInDays'
        const token = jwt.sign(payload, config.secrets.key, {expiresIn:  `30d`})
        let userObj = {
          userData : payload,
          token,
        }
        resolve(userObj);

  })
  .catch(err =>{
    let error = "";
    error =  "Email already in use";

    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = err.stack;

      reject(error);

   }  

  });
  });
}



exports.riskMonthlyReport = (monthyear) => {
  return new Promise(function(resolve, reject) {
      let query = `select type, "Total Outstanding Risks which are not closed" as name, count(*) as value from riskRegister where status <>"Closed" group by type
      union
      select "--", "Total risks which are not Closed-->" as name, count(*) as value from riskRegister where status <>"Closed"
      union
      select type, concat("Total Risks Created this month of type ",type) as name, count(*) as value from riskRegister where date_format (createdDate,"%M%Y") ='${monthyear}' group by type
      union
      select "--", "Total Risks Created this month-->" as name, count(*) as value from riskRegister where date_format (createdDate,"%M%Y") ='${monthyear}' 
      union
      select  type, concat("Risk Response Strategy agreed this Month as-->",responseStrategy) as name, count(*) as value
      from riskRegister 
      where date_format(createdDate,"%M%Y") = '${monthyear}'
      group by type, responseStrategy
      union
      select  "--", "Total Risks where Response Strategy agreed this Month as-->" as name, count(*) as value
      from riskRegister 
      where date_format(createdDate,"%M%Y") = '${monthyear}'
      union
      select type, "Total Risks Closed this month" as name, count(*) as value from riskRegister where date_format(lastUpdateDate,"%M%Y")='${monthyear}' and status="Closed"
      group by type
      union
      select type, concat("Overall Residual Risk which are not closed-->",overallresidualrisk) as name, count(*) as value
      from riskRegister
      where status <>"Closed"
      group by type, overallresidualrisk
      union
      select "--", "Total Overall Residual Risk which are not closed-->" as name, count(*) as value
      from riskRegister
      where status <>"Closed"
      union
      select type, concat("Overall Inherent Risk which are not closed-->",overallinherentrisk) as name, count(*) as value
      from riskRegister
      where status <>"Closed"
      group by type, overallinherentrisk
      union
      select "--", "Total Inherent Residual Risk which are not closed-->" as name, count(*) as value
      from riskRegister
      where status <>"Closed"
      union
      select type, concat("Overall Risk Tolerance which are not closed-->",overallrisktolerance) as name, count(*) as value
      from riskRegister
      where status <>"Closed"
      group by type, overallrisktolerance
      union
      select "--", "Total Risk Tolerance which are not closed-->" as name, count(*) as value
      from riskRegister
      where status <>"Closed"`;
      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.riskProfile = (type,riskstage,status,category) => {
  return new Promise(function(resolve, reject) {
      let s = "";
      if(status != null){
        s = ` and status = '${status}'`;
      }
      let categoryCondition = "";
      if(category != null){
        categoryCondition = `  AND category = '${category}' `;
      }

      let query = `select ${riskstage}Probability, ${riskstage}Impact,count(*)
      from
      riskRegister
      where type= '${type}'  ${s}  ${categoryCondition}
      group by ${riskstage}Probability, ${riskstage}Impact
      `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.riskProfileOverall = (type,riskstage,status,category) => {
  return new Promise(function(resolve, reject) {
      let s = "";
      if(status != null){
        s = ` and status = '${status}'`;
      }
      let categoryCondition = "";
      if(category != null){
        categoryCondition = `  AND category = '${category}' `;
      }

      let riskstageValue = `overall${riskstage}`;
      if(riskstage === 'calculatedResidualRisk'){
        riskstageValue = riskstage;
      }

      let query = `select ${riskstageValue},count(*)
      from
      riskRegister
      where type= '${type}'  ${s} ${categoryCondition} 
      group by ${riskstageValue}
      `;
      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.logging = (resource,id,field,value, method) => {
  return new Promise(function(resolve, reject) {
    let query = `Update ${resource} set deleted = 1 WHERE id =  ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


exports.kpidata = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `select DATE_FORMAT(dateofmeasurement,"%b %d, %Y") as name, value from kpiData where idKpi = ${id} order by dateofmeasurement ASC`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


/*
* Create 
*/
exports.changeLog = (key,value,table,method,id) => {
  return new Promise(function(resolve, reject) {

   let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      let query = `INSERT INTO changeLog
      (
                  object,
                  objectId,
                  field,
                  value,
                  methodType,
                  idUserCreatedBy,
                  createdDate,
                  idOrganization
                  )
            VALUES (
              '${table}',
              '${id}',
              '${key}',
              '${value}',
              '${method}',
              '1',
              '${date}',
              '1'
              )`;

      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(err =>{
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }  

  });
  });
}


exports.login = (data,req) => {
  return new Promise(function(resolve, reject) {
    let tokens = (typeof data.token == 'undefined')? '' : striptags(decodeURI(data.token.trim()));

   
      let query = `Select (SELECT COUNT(id) FROM profile WHERE userId = u.id ) as profileCount ,u.* from users as u WHERE u.email = '${data.email}'  `;
      db.sequelize.query(query).then(([results, metadata]) => {
        if(results.length == 0){
          error = {
            "errorCode" : 1006,
            "errorMessgae" : "Invalid email or password"
          };
            reject(error);
        }else{
          bcrypt.compare(data.password, results[0].password).then(function(result) {
          
            if(result == true){
              let payload = {
                  id: results[0].id,
                  packageId : results[0].packageId,
                  full_name: results[0].full_name,
                  email: results[0].email,
                  created_date: results[0].created_date,
                  profileCount : results[0].profileCount 
              } 
              let parameter =  data.rememberMe == 1 ?  'jwtLifeInDays' : 'defaultJwtLifeInDays'
                const token = jwt.sign(payload, config.secrets.key, {expiresIn:  `30d`})
                let userObj = {
                  userData : payload,
                  token,
                }
                if(tokens != null && tokens != ""){
                  // send push notification to older device
                  let tokenUpdateQuery = `Update  users set uuid = '${tokens}'  where id = ${results[0].id} `;
                  db.sequelize.query(tokenUpdateQuery);
        
                }
        

                resolve(userObj);
            }else{
              error = {
                "errorCode" : 1006,
                "errorMessgae" : "Invalid email or password"
              };
                reject(error);
            }
        })
        .catch(error =>{
          reject(error);
        })          
        }
  })
  .catch(err =>{
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }  

  });
  });
}

/*
* attachment 
*/
/*
* attachment 
*/
exports.attachment = (data) => {
  return new Promise(function(resolve, reject) {

    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
   
      let query = `INSERT INTO attachment
                  (
                    name,
                    shortDescription,
                    longDescription,
                    fileName,
                    objectId,
                    objectName,
                    idUserCreatedBy,
                    createdDate,
                    idOrganization
                       )
            VALUES ( 
              '${data.name}',
              '${data.shortDescription}',
              '${data.longDescription}',
              '${data.fileName}',
              '${data.objectId}',
              '${data.objectName}',
              '1', 
               '${date}', 
              '${data.idOrganization}'
              )
              
              `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(err =>{
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }  

  });
  });
}

   
   
exports.accessControl = (id) => {
  return new Promise(function(resolve, reject) {
    /*  
    let query = `Select * 
      From page a, userProfileHasPage b
          Where a.id=b.idPage and idUserProfile= '${id}' 
      `;
      */
     let query = `SELECT a.itemName as itemNames,a.type, a.shortDescription as moduledescription,a.name as captions, a.icon  icons , a.status status ,   b.info,
       b.infoLink,b.caption,a.orderBy orderBys,b.ab,a.path paths,b.definition,b.icon icon,b.objectName , b.path , b.orderBy
      FROM module a, page b, userProfileHasPage c
      WHERE a.id=b.idModule AND
      b.id=c.idPage AND
      idUserProfile=  '${id}' 
     `;

      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.themeIntersectionUpdate = (data) => {
  return new Promise(function(resolve, reject) {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

      if(typeof data.POST != undefined && data.POST.length > 0){

        data.POST.forEach(post=>{
            console.log("post",post);
          let query = `INSERT INTO themeIntersection
                  (
                  idTheme,
                  tableName,
                  idParent,
                  idUserCreatedBy,
                  idOrganization,
                  createdDate)
              VALUES (
                    '${post.idTheme}',
                    '${post.tableName}',
                    '${post.idParent}',
                    1,
                    '1',
                    '${date}'
                    );`;
          db.sequelize.query(query).then(([results, metadata]) => {
          })
        .catch(error =>{
        });
    
        });
        if(data.DELETE.length > 0){
          data.DELETE.forEach(del => {
            let query = `DELETE FROM themeIntersection WHERE id = '${del}'`;
              db.sequelize.query(query).then(([results, metadata]) => {
              })
            .catch(error =>{
            });
      
          });
        }
        resolve({});


      }
      else if(typeof data.DELETE != undefined && data.DELETE.length > 0){
        data.DELETE.forEach(del => {
          let query = `DELETE FROM themeIntersection WHERE id = '${del}'`;
            db.sequelize.query(query).then(([results, metadata]) => {
            })
          .catch(error =>{
          });
    
        });

      }
       resolve({});

  });
}




exports.cron = () => {
  return new Promise(function(resolve, reject) {
    let query = `SELECT r.remainder_name,TIMESTAMPDIFF(MINUTE,CURRENT_TIME(),r.remainder_time) AS a,r.remainder_time AS b,CURRENT_TIME() AS c,r.id,p.userId,(SELECT UUID FROM users  WHERE id = p.userId) AS uuids FROM remainder AS r
    INNER JOIN profile AS p
    ON r.profileId = p.id
    WHERE r.remainder_notes_send = 0 `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


exports.solutionrequirementmatrixUpdate = (id,data) => {
  return new Promise(function(resolve, reject) {
    let query = `Update solutionRequirementMatrix 
    set gap = '${data.gap}',
    gapMitigation = '${data.gapMitigation}',
    shortDescription = '${data.shortDescription}'
    WHERE id =  ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
function logLoggedIn(id,idOrganization,req){
   const internalIp = require('internal-ip');
   var ip = req.headers['x-forwarded-for'] || 
   req.connection.remoteAddress || 
   req.socket.remoteAddress ||
   (req.connection.socket ? req.connection.socket.remoteAddress : null);   
   let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let query  = `INSERT INTO loginHistory
        (
        idAppUser,
        ipAddress,
        broweserType,
        deviceType,
        idOrganization,
         createdDate ,
         idUserCreatedBy
        )
      VALUES (
      '${id}',
      '${ip}',
      '${req.useragent.browser}',
      '${req.useragent.platform} ${req.useragent.os}',
      '${idOrganization}',
      '${date}',
      '${id}'

      )`;
      db.sequelize.query(query).then(([results, metadata]) => {
      })
    .catch(error =>{
      console.log(error)
     });

}


/*
* Create 
*/
exports.passwordChange = (data,userId) => {
  return new Promise(function(resolve, reject) {

   
      let query = `UPDATE appUser set password =  '${data.password}' WHERE id = '${userId}'`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(err =>{
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }  

  });
  });
}

/*
* valid pass
*/
exports.validPassword = (oldPassword,userId) => {
  return new Promise(function(resolve, reject) {
    let query = `Select * from appUser WHERE id = ${userId}  `;
    db.sequelize.query(query).then(([results, metadata]) => {
      bcrypt.compare(oldPassword, results[0].password).then(function(result) {
      if(result == true){
        resolve()
      }else{
        error = "Invalid current password"
        reject(error);
      }
      })
      .catch(error =>{
        reject(error);

      }) 
    })
  })
}

exports.updateItControll = (data) => {
  return new Promise(function(resolve, reject) {
    let query = `Update itControl set status = '${data.status}' , testResultDescription = '${data.testResultDescription}' , testResultDate = '${data.testResultDate}'
      WHERE id =  ${data.idItControl} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getRiskRegisterHasitControl = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `Select * from riskRegisterHasItControl
      Where idItControl  = '${id}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.controlEffectiveness = () => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.id, a.name ,a.status, COUNT(b.id) AS risks, AVG(weight) AS AW, CONCAT (AVG(controlScore)/5*100,'%') AS AC 
      FROM itControl a , riskRegisterHasItControl b 
      WHERE a.id=b.iditcontrol 
      GROUP BY a.id`;
      db.sequelize.query(query).then(([results, metadata]) => {
        console.log("results",results);
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getAllRiskRegisterHasitControl = (idriskregister,iditcontrol) => {
  return new Promise(function(resolve, reject) {
    let respQuery = "";
    if(idriskregister != null && iditcontrol != null){
      respQuery = " WHERE z.idriskregister = '"+idriskregister+"' AND z.iditControl = '"+iditcontrol+"'  ";
    }
    else if(idriskregister != null ){
      respQuery = " WHERE z.idriskregister = "+idriskregister+"  ";
    }    
    else if(iditcontrol != null ){
      respQuery = " WHERE z.iditControl = "+iditcontrol+"  ";
    }    

      let query = `SELECT z.*  , a.name AS riskRegisterName , a.status AS riskRegisterStatus ,b.type as itControlType, b.status AS itControlStatus   , b.name AS itControlName   FROM riskRegisterHasItControl AS z LEFT JOIN  riskRegister AS a
      ON z.idRiskRegister = a.id   LEFT JOIN  itControl AS b
      ON z.idItControl = b.id  ${respQuery}`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.updateRiskRegisterHasitControlStatus = (id) => {
  return new Promise(function(resolve, reject) {
    let query = `Update riskRegister set status = 'Control Failed' WHERE id =  ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.itControlAssessment = (type,field,category) => {
  return new Promise(function(resolve, reject) {
      let categoryCondition = "";
      if(category != null){
        categoryCondition = `  AND category = '${category}' `;
      }
      let query = `SELECT ${field}, COUNT(*) totalNumberOfRisks, (SELECT score FROM riskProfileMatrixScore WHERE overallrating=${field} AND approach='band' AND TYPE="${type}") score,  COUNT(*)*(SELECT score FROM riskProfileMatrixScore WHERE overallrating=${field} AND approach="band" AND TYPE='${type}') total 
      FROM riskRegister
      WHERE ${field} IS NOT NULL AND ${field} <> '' AND ${field} <> 'undefined' AND TYPE='${type}' ${categoryCondition}
      GROUP BY ${field}`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getScore = () => {
  return new Promise(function(resolve, reject) {

      let query = `SELECT score FROM riskProfileMatrixScore WHERE overallrating = 'Very High' AND approach = 'band' AND TYPE = 'Threat'
      `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getBusinessOutcome = () => {
  return new Promise(function(resolve, reject) {
      let query = `Select * from businessOutcome`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
exports.getBusinessOutcomeDelayTrack = () => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT 'delayed' AS keyName,VALUE FROM riskParameter WHERE NAME='limitForDelayedBusinessOutcome'
      UNION
       SELECT 'track' AS keyName, VALUE FROM riskParameter WHERE NAME='limitForOnTrackBusinessOutcome'`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getBusinessOutcomeResult = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT id,currentValue, startValue, targetValue, currentValueDate, startDate, targetDate, 
      (currentValue - startValue)/(targetValue-startValue) AS  VALUE,
      DATEDIFF( currentValueDate , startDate ) /DATEDIFF(targetDate, startDate) AS datevalue,
      (currentValue - startValue)/((targetValue-startValue)* DATEDIFF( currentValueDate , startDate ) /DATEDIFF(targetDate, startDate) ) *100 AS result
      FROM businessOutcome
      WHERE id=   '${id}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results[0]);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.updateBusinessOutcome = (id) => {
  return new Promise(function(resolve, reject) {
    let query = `update businessOutcome set status= 
    (CASE WHEN (((currentValue - startValue)/(targetValue-startValue))/( CAST(datediff(day, currentValueDate , startDate) AS FLOAT) /datediff(day, targetDate, startDate) )) *100 > (select value from riskParameter where name='limitForOnTrackBusinessOutcome') THEN 'On Track'
    WHEN (((currentValue - startValue)/(targetValue-startValue))/( CAST(datediff(day, currentValueDate , startDate) AS FLOAT) /datediff(day, targetDate, startDate) )) *100 < (select value from riskParameter where name='limitForDelayedBusinessOutcome' ) THEN 'Delayed'
    ELSE 'Keep Watch'
    END) where id =  ${id} `;
    db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
exports.getTheme = (id) => {
  return new Promise(function(resolve, reject) {
    let where = "";  
    if(id != null || id != "" ){
        where  = `where id = '${id}'  `;
      }
      if(id == null){
        where  = "";
      }
      let query = `Select * from theme   ${where} `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.updateThemePriority = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `update theme set priority= 
      (CASE 
      WHEN ((select count(*) from businessOutcome where idTheme= '${id}' and changeType = 'Transform') >= (select value from riskParameter where name='countOfTransformOutcomesForHighPriorityTheme')) THEN 'High'
      WHEN ((select count(*) from businessOutcome where idTheme= '${id}' and changeType = 'Grow') >= (select value from riskParameter where name='countOfGrowOutcomesForMediumPriorityTheme')) THEN 'Medium'
      ELSE 'Low'
      END)
      Where id= '${id}'  `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
exports.updateThemeStatus = (id,score,data) => {
  return new Promise(function(resolve, reject) {
     let status = 'Keep Watch';
    data.forEach((tm,l) =>{
      if(score == tm.score){
        status =  tm.displayValue;
      }
   });

      let query = `update theme set status=  '${status}' Where id= '${id}'  `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getBusinessOutcomeById = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `Select * from businessOutcome where idKpiPrimary =  '${id}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.updateValueDateBusinessoutcome = (id,value,date) => {
  return new Promise(function(resolve, reject) {
      let query = `update businessOutcome set
      currentValue = '${value}',
      currentValueDate = '${date}'
      Where id= '${id}'  `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getBusinessoutcomeForTheme = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `select id, status, changetype from businessOutcome where idTheme = '${id}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getThemeMeta = (type) => {
  return new Promise(function(resolve, reject) {
      let query = `Select * from listOfValues where type = '${type}'`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getThemeWeightLov = () => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT * FROM listOfValues WHERE TYPE = 'BUSINESS_OUTCOME_CHANGE_TYPE'`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
exports.themeStatusCalulation = (businessArray,metaStatus,metaChangeType) =>{
  return new Promise(function(resolve, reject) {
    try{
      let totalScore = "";
      let totalWeight = "";
  
      businessArray.forEach((ba,i) =>{
         let score = 0;
         let weight = 0;
         metaChangeType.forEach(mc =>{
          if(mc.displayValue == ba.changetype){
             weight = mc.weight;
          }
        })
        metaStatus.forEach(ms =>{
          if(ms.displayValue == ba.status){
            score = ms.score;
         }
  
        })
  
          if(score != 0  && weight != 0){
              totalScore =  + totalScore +  ((score *  weight)/ 100);
              totalWeight =  + totalWeight +  (weight/ 100);
  
          }
          if(i == businessArray.length-1){
            let resp =    Math.round(totalScore / totalWeight);
            console.log("without floor",totalScore / totalWeight)
            console.log("with floor",resp)

            resolve({
              resp
            })
      
          }
      })
    }
    catch(e){
        reject({e});
    }


  })

}

exports.getSolutionrequirementmatrix = (id) => {
  return new Promise(function(resolve, reject) {
     let query = `Select a.idInitiative , a.id as idSolution , b.id as idRequirement from solution as a , requirement as b 
                  WHERE a.idInitiative = ${id} AND b.idInitiative = ${id} `;
                  db.sequelize.query(query).then(([results, metadata]) => {
                    resolve(results);
              })
              .catch(error =>{
                reject(error);
            
              });
          /*  
     let query2 = `Select idInitiative,idSolution, idRequirement from solutionRequirementMatrix WHERE 
        idInitiative = ${id} `;

        let generateDataSql = `INSERT INTO solutionRequirementMatrix (idInitiative,idRequirement,idSolution, idOrganization, idUserCreatedBy,createdDate)
        SELECT  a.idInitiative,a.id idRequirement, b.id idSolution, a.idOrganization, 1, NOW()
        FROM requirement a, solution b
        WHERE a.idInitiative= ${id} AND b.idInitiative=${id}
        `;
        */

  });
}

exports.getSolutionrequirementmatrixMain = (id) => {
  return new Promise(function(resolve, reject) {
    
     let query = `Select idInitiative,idSolution, idRequirement from solutionRequirementMatrix WHERE 
     idInitiative = ${id} `;
                  db.sequelize.query(query).then(([results, metadata]) => {
                    resolve(results);
              })
              .catch(error =>{
                reject(error);
            
              });

  });
}

exports.addSolutionrequirementmatrixMain = (data) =>{
  return new Promise(function(resolve, reject) {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let query = `INSERT INTO solutionRequirementMatrix (idInitiative,idRequirement,idSolution, idOrganization, idUserCreatedBy,createdDate)
    VALUES('${data.idInitiative}', '${data.idRequirement}' , '${data.idSolution}' , '1' , '1', '${date}')`;
                   db.sequelize.query(query).then(([results, metadata]) => {
                   resolve(results);
             })
             .catch(error =>{
               reject(error);
           
             });
            });
}

exports.getSolutionrequirementmatrixUpdated = (id) => {
  return new Promise(function(resolve, reject) {
    
     let query = `Select * from solutionRequirementMatrix WHERE 
     idInitiative = ${id} `;
                  db.sequelize.query(query).then(([results, metadata]) => {
                    resolve(results);
              })
              .catch(error =>{
                reject(error);
            
              });

  });
}


exports.globalSearchMeta = (key) => {
  return new Promise(function(resolve, reject) {
    let query = `SELECT a.* FROM visualization AS a  WHERE a.chartName =  '${key}'  `;
    db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
    })
    .catch(err =>{
    let error = {};
    error = {
    "errorCode" : 1001,
    "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
    reject(error);
    
    }
  });

  })

}

exports.editUser = (data,id) => {
  return new Promise(function(resolve, reject) {
     let userCheck = `select id from appUser where email = '${data.email}' AND id != ${id} `;
     db.sequelize.query(userCheck).then(([results, metadata]) => {
            if(results.length === 0){
              let query = `Update appUser 
              set name =  '${data.name}',
              idAppRole =  '${data.idAppRole}',
              idUserProfile =  '${data.idUserProfile}',
              personTitle =  '${data.personTitle}',
              firstName =  '${data.firstName}',
              email =  '${data.email}',
              idUserLastUpdateBy =  '${data.idUserLastUpdateBy}',
              lastUpdateDate =  '${data.lastUpdateDate}'
               WHERE id = ${id}
              
              `;
                db.sequelize.query(query).then(([results, metadata]) => {
                  resolve(results);
                })
                .catch(err =>{
                let error = {};
                error = {
                "errorCode" : 1001,
                "errorMessgae" : "Name is not unique , Please provide  unique name"
                };
                if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
                reject(error);

                }else{
                error = {
                "errorCode" : 1005,
                "errorMessgae" : err.stack
                };

                reject(error);

                }  

                });

            }else{
              error = {
                "errorCode" : 1011,
                "errorMessgae" : "Email already exist."
                };
                reject(error);

            }
        })
        .catch(err =>{
          let error = {};
          error = {
            "errorCode" : 1001,
            "errorMessgae" : "Name is not unique , Please provide  unique name"
          };
          if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
            reject(error);

        }else{
          error = {
            "errorCode" : 1005,
            "errorMessgae" : err.stack
          };

            reject(error);

        }  

        });

  });
}



exports.accessControlForGlobalSearch = (key) => {
  return new Promise(function(resolve, reject) {
    let query = `SELECT  searchOrder, b.name
    FROM module a, page b, userProfileHasPage c
    WHERE a.id=b.idModule AND
    b.id=c.idPage AND searchFlag=1 and
    idUserProfile=  ${key}  ORDER BY searchOrder `;
    db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
    })
    .catch(err =>{
      console.log("err",err);
    let error = {};
    error = {
    "errorCode" : 1020,
    "errorMessgae" : err.stack
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
    reject(error);
    
    }else{
      reject(error);

    }
  });

  })

}

exports.appViewForCurrentUser = (id, objectType) => {
  return new Promise(function(resolve, reject) {
     let query = `Select * from appView  
     where
     idPage in 
     (SELECT a.idPage
     FROM userProfileHasPage a
      WHERE
     idUserProfile= ${id} and objectType='${objectType}') `;

      db.sequelize.query(query).then(([results, metadata]) => {

        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.homePageData = (id) => {
  return new Promise(function(resolve, reject) {
     let query = `select * from appView a, appUserHasAppView  b
     where 
     a.id=b.idAppView and
     idAppUser= ${id}  and objectType='list' `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
    })
  .catch(error =>{
    reject(error);
  });
  });
}


exports.homePage = (query) => {
  return new Promise(function(resolve, reject) {
      // let query = `select "My Backlog" as name, "Number of My Backlogs which are not closed" as tooltip, count(*) as value from backlog where status <>"Closed" and idAppUser=${idAppUser}
      // union
      // select "My Strategies" as name, "Number of Strategies in which I participate" as tooltip, count(*) as value from businessStrategyHasAppRole  Where idAppRole=${idAppRole}
      // union
      // select "Strategies as Owner" as name, "Number of Strategies owned by me" as tooltip, count(*) as value from businessStrategy  Where idAppRoleOwner=${idAppRole}
      // union
      // select "My Themes" as name, "Number of Themes assigned to me" as tooltip, count(*) as value from theme Where idAppRole=${idAppRole}
      // union
      // select "Strategic Choices Pending" as name, "Number of Choices pending" as tooltip, count(*) as value from strategicChoice a, businessStrategyHasAppRole b
      // where a.idBusinessStrategy = b.idBusinessStrategy and
      // a.objectStatus="Pending" and
      // b.idAppRole=${idAppRole}
      // `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

// exports.homePageList = (idAppUser, idAppRole) => {
//   return new Promise(async(resolve, reject) => {
//   //     let query = `select * from backlog where idAppUser=${idAppUser}
//   //     `;
//   //     db.sequelize.query(query).then(([results, metadata]) => {
//   //       resolve(results);

//   // })
//   // .catch(error =>{
//   //   reject(error);

//   // });
//   const results = []
//   try {
    
//     let backlog = await db.sequelize.query(`select * from backlog where idAppUser='${idAppUser}' and status <> 'Closed' ORDER BY createdDate DESC`)
//     results.push({ name:"My Backlog" ,tooltip: 'Number of My Backlogs which are not closed', value: backlog[0]})
//     let initiative = await db.sequelize.query(`select * from initiative where idAppUser='${idAppUser}' ORDER BY createdDate DESC`)
//     results.push({ name:"My Initiatives" ,tooltip: 'Initiatives assigned to me', value: initiative[0]})
//     let dataCustodian = await db.sequelize.query(`select * from dataEntity where idAppRoleCustodian='${idAppRole}' ORDER BY name DESC`)
//     results.push({ name:"Data Custodian" ,tooltip: 'I am custodian of following data:', value: dataCustodian[0]})
//     let outcomes = await db.sequelize.query(`select * from businessOutcome where idAppRoleOutcomeOwner='${idAppRole}'  ORDER BY name DESC`)
//     results.push({ name:"Business Outcome Owner" ,tooltip: 'I am owner of following Business Outcomes:', value: outcomes[0]})
//     let strategies = await db.sequelize.query(`select * from businessStrategy where idAppUser='${idAppUser}'`)
//     results.push({ name:"My Strategies" ,tooltip: 'I am Facilitator of these strategies:', value: strategies[0]})
    
//     resolve(results)
//   }
//   catch(e){
//     reject(e)
//   }
// });
// }

exports.eligibleAppView = (idUserProfile, objectType) => {
  return new Promise(function(resolve, reject) {
     let query = `Select a.*, b.name as pageName from appView a, page b
     Where a.idPage = b.id and
     a.objectType='${objectType}'
     and a.activeFlag=1
     and a.viewType='homepage'
     and a.idPage in 
     (select idPage
      From userProfileHasPage where idUserProfile=${idUserProfile})`

      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
    })
  .catch(error =>{
    reject(error);
  });
  });
}

exports.selectedAppView = (idAppUser, objectType) => {
  return new Promise(function(resolve, reject) {
     let query = `Select a.id as idIntersection, b.*, c.name as pageName  
     from 
     appUserHasAppView a, appView b, page c
     where
     b.idPage = c.id and
     a.idAppView = b.id  AND
     b.activeFlag=1 AND
     b.viewType='homepage' AND
     b.objectType='${objectType}' AND
     a.idAppUser = ${idAppUser}`

    //  b.id AS id, b.name, b.shortDescription

    db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
    })
  .catch(error =>{
    reject(error);
  });
  });
}

exports.getAllCount = (resource,orderBy,query,user,fk) => {
  return new Promise(function(resolve, reject) {
         
      let where  = "";
      if(fk != ""){
        where  = `WHERE ${fk} = ${user.id} `;
      }
      let respQuery = `Select count(id) as total from  ${resource}  ${where} `;

      let queryParams = '';
      let x = 0;
      let sortBy = "DESC";
      
      if(Object.keys(query).length !== 0 && query.constructor === Object){
        Object.keys(query).forEach((key,i)=>{
          if(key != "orderBy"  && key != "sortBy" && key != "months" && key != "grouping" && key != 'children' && key != 'limit' && key != 'q' ){
            if(key == 'month'){
              queryParams += (x == 0)? `WHERE DATE_FORMAT(created_date,'%m')  = '${query[key]}' ` : `AND DATE_FORMAT(created_date,'%m')  = '${query[key]}' `;

            }

            else if(query[key] == "" || query[key] == "null"){
              queryParams += (x == 0)? `WHERE ${key} IS NULL ` : `AND  (${key} IS NULL OR ${key} = 'NULL'  OR ${key}= ''   )`;
              x++;
                
            }
            else{
              queryParams += (x == 0)? `WHERE ${key} = '${query[key]}' ` : `AND ${key} = '${query[key]}' `;
              x++;
    
            }
          }
          if(key == "sortBy" && query[key] != ""){
            sortBy = (query[key] == 'asc' || query[key] == 'ASC')? 'ASC' : 'DESC';
          }  
  
        })
  
      }
      if(queryParams != ""){
        respQuery = ` ${respQuery} ${queryParams}`;
  
      }
      if(typeof query.q != "undefined"){
         if(x === 0){
          respQuery = `${respQuery}  WHERE z.name like '%${query.q}%' or z.shortDescription like '%${query.q}%' or z.longDescription like '%${query.q}%'  or z.id like '%${query.q}%'  `;
  
         }else{
          respQuery = `${respQuery} AND  z.name like '%${query.q}%' or z.shortDescription like '%${query.q}%' or z.longDescription like '%${query.q}%  or z.id like '%${query.q}%' `;
  
         }
  
      }

      db.sequelize.query(respQuery).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.businessStrategyHas = (tableName,data) => {
  return new Promise(function(resolve, reject) {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let firstWord = tableName.charAt(0).toUpperCase();

      if(typeof data.POST != undefined && data.POST.length > 0){

        data.POST.forEach(post=>{
            let dynamicKey = 'id'+firstWord+tableName.slice(1);
            let dynamicValues = post[dynamicKey];

            console.log("dynamicKey",dynamicKey);
            
            console.log("dynamicValues",dynamicValues);

          let query = `INSERT INTO businessStrategyHas${firstWord}${tableName.slice(1)}
                  (
                  idBusinessStrategy,
                  id${tableName},
                  idUserCreatedBy,
                  idOrganization,
                  createdDate)
              VALUES (
                    '${post.idBusinessStrategy}',
                    '${dynamicValues}',
                    1,
                    '1',
                    '${date}'
                    );`;
          db.sequelize.query(query).then(([results, metadata]) => {
          })
        .catch(error =>{
        });
    
        });
        if(data.DELETE.length > 0){
          data.DELETE.forEach(del => {
            let query = `DELETE FROM businessStrategyHas${firstWord}${tableName.slice(1)} WHERE id = '${del}'`;
              db.sequelize.query(query).then(([results, metadata]) => {
              })
            .catch(error =>{
            });
      
          });
        }
        resolve({});


      }
      else if(typeof data.DELETE != undefined && data.DELETE.length > 0){
        data.DELETE.forEach(del => {
          let query = `DELETE FROM businessStrategyHas${firstWord}${tableName.slice(1)} WHERE id = '${del}'`;
          db.sequelize.query(query).then(([results, metadata]) => {
            })
          .catch(error =>{
          });
    
        });

      }
       resolve({});

  });
}

exports.appUserHas = (tableName,data) => {
  return new Promise(function(resolve, reject) {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let firstWord = tableName.charAt(0).toUpperCase();

      if(typeof data.POST != undefined && data.POST.length > 0){

        data.POST.forEach(post=>{
            let dynamicKey = 'id'+firstWord+tableName.slice(1);
            let dynamicValues = post[dynamicKey];

            console.log("dynamicKey",dynamicKey);
            
            console.log("dynamicValues",dynamicValues);

          let query = `INSERT INTO appUserHas${firstWord}${tableName.slice(1)}
                  (
                  idAppUser,
                  id${tableName},
                  idUserCreatedBy,
                  idOrganization,
                  createdDate)
              VALUES (
                    '${post.idAppUser}',
                    '${dynamicValues}',
                    1,
                    '1',
                    '${date}'
                    );`;
          db.sequelize.query(query).then(([results, metadata]) => {
          })
        .catch(error =>{
        });
    
        });
        if(data.DELETE.length > 0){
          data.DELETE.forEach(del => {
            let query = `DELETE FROM appUserHas${firstWord}${tableName.slice(1)} WHERE id = '${del}'`;
              db.sequelize.query(query).then(([results, metadata]) => {
              })
            .catch(error =>{
            });
      
          });
        }
        resolve({});


      }
      else if(typeof data.DELETE != undefined && data.DELETE.length > 0){
        data.DELETE.forEach(del => {
          let query = `DELETE FROM appUserHas${firstWord}${tableName.slice(1)} WHERE id = '${del}'`;
          db.sequelize.query(query).then(([results, metadata]) => {
            })
          .catch(error =>{
          });
    
        });

      }
       resolve({});

  });
}

/*
* Get single provider
*/

exports.businessStrategyCapabilities = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT  c.id, c.name, c.shortDescription, c.longDescription, c.category, c.criticalityLevel, 
      c.strategicImpact, c.financialImpact, count(*) themeCount
      FROM theme a, themeIntersection b, businessCapability c
      WHERE 
      a.id=b.idTheme and
      b.idParent = c.id and
      tableName='businessCapability' AND
      a.idBusinessStrategy=  '${id}'
      group by c.id, c.name, c.shortDescription, c.longDescription, c.category, c.criticalityLevel, 
      c.strategicImpact, c.financialImpact`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


exports.getBusinessStrategy = (table,id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT c.*, b.name themeName
      FROM businessStrategy a, theme b, ${table} c
      WHERE 
      a.id=b.idBusinessStrategy AND
      b.id=c.idTheme AND
      a.id=  ${id}  `;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getIdTheme = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.idTheme, b.name themeName from 
      businessStrategyHasTheme a, theme b
      where b.id=a.idTheme AND
      a.idBusinessStrategy=${id}`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getRoadmap = (table,id) => {
  return new Promise(function(resolve, reject) {
    let query = `SELECT c.* from ${table} c
    WHERE c.idTheme=${id}`
    db.sequelize.query(query).then(([results, metadata]) => {
    resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getAllBusinessStrategy = (idAppRole, idUserProfile) => {
  return new Promise(function(resolve, reject) {
      // let query = `SELECT id, idBusinessStrategy, name, shortDescription, longDescription, objectStatus, objectType
      // FROM businessStrategy`;
      let query = `Select z.id, z.idBusinessStrategy, z.name, z.shortDescription, z.longDescription, z.objectStatus, z.objectType  , a.name as businessStrategyName   , b.name as appRoleName   , c.name as appUserName, d.raci, 
      (CASE WHEN d.accessAllowed IS NULL THEN 0
      ELSE d.accessAllowed 
      END) as accessAllowed
      from businessStrategy as z LEFT JOIN  businessStrategy as a
      ON z.idBusinessStrategy = a.id   LEFT JOIN  appRole as b
      ON z.idAppRoleOwner = b.id   LEFT JOIN  appUser as c
      ON z.idAppUser = c.id LEFT JOIN businessStrategyHasAppRole d
      ON z.id=d.idBusinessStrategy
      AND d.idAppRole=${idAppRole}
      Where z.archivedFlag = 0`
      
      let query2 = `select value from riskParameter where name='leadFacilitatorUserProfile'`
      let query3 = `select name from userProfile where id=${idUserProfile}`
      db.sequelize.query(query).then(([results, metadata]) => {
        db.sequelize.query(query2).then(([parameter, metadata]) => {
          db.sequelize.query(query3).then(([profile, metadata]) => {
              if(parameter.value === profile.name){
                results.forEach(r=> {
                  r.accessAllowed = 1
                })
              }
              resolve(results);
            })
            .catch(error =>{
              reject(error);
          });
      })
      .catch(error =>{
        reject(error);
    
      });
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.myComments = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.id as idDiscussion, c.id as idAppUser, c.name as postedBy, a.msgText, a.createdDate as commentedOn, b.id as idBusinessStrategy, b.name as strategyName, a.timesLiked
      FROM discussion a, businessStrategy b, appUser c
      WHERE 
      b.id = a.objectId AND
      c.id=a.idAppUser AND
      a.idAppUser=${id} AND
      a.objectName='businessstrategy'`
      
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.commentsAddressedToMe = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.id as idDiscussion, c.id as idAppUser, c.name as postedBy, a.msgText, a.createdDate as commentedOn, b.id as idBusinessStrategy, b.name as strategyName, a.timesLiked
      FROM discussion a, businessStrategy b, appUser c, discussionHasAppUser d
      WHERE 
      b.id = a.objectId AND
      c.id=a.idAppUser AND
      a.id=d.idDiscussion AND
      d.idAppUser=${id} AND
      a.objectName='businessstrategy'`
      
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getDiscussionById = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `Select * from discussion where id =  '${id}' `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results[0]);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.getUsersByRole = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.idBusinessStrategy,c.name as businessStrategyName, a.idAppRole, b.id AS idAppUser, b.name, b.email FROM 
      businessStrategyHasAppRole a, 
      appUser b,
      businessStrategy c
      WHERE a.idAppRole = b.idAppRole
      AND a.idBusinessStrategy = c.id
      AND a.idBusinessStrategy=${id}`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.insertDiscussionHasIdAppUser = (idDiscussion, idAppUser) => {
  return new Promise(function(resolve, reject) {
      let query = `INSERT INTO discussionHasAppUser (idDiscussion, idAppUser)
      VALUES (${idDiscussion}, ${idAppUser})`;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.appUserProfile = (fileName,userId) => {
  return new Promise(function(resolve, reject) {

      let query = `UPDATE appUser set profilePicture = '${fileName}' WHERE id = ${userId}  `;
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve(results);
  })
  .catch(err =>{
    let error = {};
    error = {
      "errorCode" : 1001,
      "errorMessgae" : "Name is not unique , Please provide  unique name"
    };
    if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
      reject(error);

   }else{
     error = {
      "errorCode" : 1005,
      "errorMessgae" : err.stack
    };

      reject(error);

   }
  });
});
}

exports.businessStrategyDisruptions = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT *, a.shortDescription as businessDisruptionShortDescription
      FROM businessDisruption a, businessStrategyHasBusinessDisruption b
      WHERE a.id=b.idBusinessDisruption
      AND b.idBusinessStrategy=${id}`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.businessStrategyStatements = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT *, a.shortDescription as statementShortDescription
      FROM statement a, businessStrategyHasStatement b
      WHERE a.id=b.idStatement
      AND b.idBusinessStrategy=${id}`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.stakeholderInStrategies = (idAppUser, idAppRole) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT  a.strategyName, a.objectId, a.icon, z.msgText, z.createdDate, z.unreadMessages FROM
        (SELECT NAME AS strategyName,id objectId, icon FROM businessStrategy
        WHERE archivedFlag=0
        AND (idAppRoleOwner = ${idAppRole} 
        OR idAppUser=${idAppUser}
        OR id IN (
        SELECT idBusinessStrategy FROM 
        businessStrategyHasAppRole
        WHERE idAppRole=${idAppRole}))) a
      LEFT JOIN
        (SELECT  az.objectId, az.msgText, az.createdDate, bz.unreadMessages
          FROM
          (SELECT  a.objectId, a.msgText, a.createdDate
          FROM discussion a JOIN
          (SELECT objectId, MAX(createdDate) createdDate FROM discussion 
          WHERE objectId > 0
          GROUP BY objectId) t1
          ON t1.createdDate = a.createdDate
          AND t1.objectId = a.objectId) az
          LEFT JOIN
          (SELECT d.objectid,COUNT(*) unreadMessages
          FROM discussionHasAppUser  c, discussion d
          WHERE
          c.idDiscussion=d.id AND
          d.objectName='businessstrategy' AND
          c.idAppUser=${idAppUser} AND
          c.readFlag=0
          GROUP BY d.objectId) bz
        ON az.objectId= bz.objectId) z
      ON a.objectId = z.objectId`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.allDiscussionForStrategy = (idBusinessStrategy, idAppUser) => {
  return new Promise(function(resolve, reject) {
    let userSql = `SELECT b.id AS idAppUser, b.name FROM 
      businessStrategyHasAppRole a, 
      appUser b
      WHERE a.idAppRole = b.idAppRole
      AND a.idBusinessStrategy=${idBusinessStrategy}`

    let query = `SELECT a.idAppUser, b.name, a.msgText, a.createdDate
      FROM discussion a, appUser b
      WHERE b.id=a.idAppUser AND
      a.objectName='businessstrategy' AND
      a.objectId=${idBusinessStrategy}`

    let dbType = config.dbConfig.dbType;
    let readFlagUpdateQuery

    if(dbType === 'mssql'){
      readFlagUpdateQuery = `UPDATE discussionHasAppUser
      SET 
      readFlag = 1
	    from discussionhasappuser INNER JOIN
      discussion ON discussionHasAppUser.idDiscussion = discussion.id 
      WHERE
      discussion.objectId=${idBusinessStrategy} AND
      discussion.objectName='businessstrategy' AND
      discussionHasAppUser.idAppUser=${idAppUser}`
    }
    else{
      readFlagUpdateQuery = `UPDATE discussionHasAppUser
      INNER JOIN
      discussion ON discussionHasAppUser.idDiscussion = discussion.id 
      SET 
      readFlag = 1
      WHERE
      discussion.objectId=${idBusinessStrategy} AND
      discussion.objectName="businessstrategy" AND
      discussionHasAppUser.idAppUser=${idAppUser}`
    }
    
    db.sequelize.query(userSql).then(([users, metadata]) => {
      db.sequelize.query(query).then(([results, metadata]) => {
        resolve({users, discussions: results});
        db.sequelize.query(readFlagUpdateQuery).then(([results, metadata]) => {
        })
      })
      .catch(error =>{
        reject(error);

      });
    })
    .catch(error =>{
      reject(error);

    });
  })
}

exports.directlyMessagedUsers = (idAppUser) => {
  return new Promise(function(resolve, reject) {
      // let query = ` SELECT DISTINCT a.id, a.name
      //   FROM appUser a, discussion b, discussionHasAppUser c 
      //   WHERE a.id=b.idAppUser AND
      //   b.id=c.idDiscussion AND
      //   c.idAppUser=${idAppUser} 
      //   ORDER by a.name`
      let query = `SELECT DISTINCT t1.idAppUser, t1.name, a.msgText, t1.createdDate
      FROM discussion a, (SELECT t5.idAppUser, t5.NAME, MAX(t5.createdDate) createdDate FROM
      ((SELECT discussionHasAppUser.idAppUser AS idAppUser, appUser.name, discussion.createdDate, discussion.objectId
      FROM discussion,appUser,discussionHasAppUser
      WHERE appUser.id=discussionHasAppUser.idAppUser
      AND discussion.id=discussionHasAppUser.idDiscussion
      AND discussion.idAppUser=${idAppUser} ) 
      UNION 
      (SELECT discussion.idAppUser, appUser.name, discussion.createdDate, discussion.objectId
      FROM discussion, appUser,discussionHasAppUser
      WHERE appUser.id=discussion.idAppUser
      AND discussion.id=discussionHasAppUser.idDiscussion
      AND discussionHasAppUser.idAppUser=${idAppUser}) )
      t5
      WHERE (t5.objectId IS NULL OR t5.objectId='' OR t5.objectId=0)
      GROUP BY t5.idAppUser, t5.name) t1,
      discussionHasAppUser b
      WHERE t1.createdDate = a.createdDate
      AND a.id=b.idDiscussion
      AND (a.idAppUser=${idAppUser} OR b.idAppUser=${idAppUser})
      AND (a.idAppUser=t1.idAppUser OR b.idAppUser=t1.idAppUser)
      ORDER BY t1.createdDate DESC`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.directMessagesReceived = (idSender, idReceiver) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT b.idAppUser, a.name, b.msgText, b.createdDate
      FROM appUser a, discussion b, discussionHasAppUser c 
      WHERE a.id=b.idAppUser AND
      b.id=c.idDiscussion AND
      c.idAppUser=${idReceiver} AND
      a.id=${idSender} AND
      (b.objectId IS NULL OR
        b.objectId='' OR b.objectId=0)
      UNION
      SELECT b.idAppUser, a.name, b.msgText, b.createdDate
      FROM appUser a, discussion b, discussionHasAppUser c 
      WHERE a.id=b.idAppUser AND
      b.id=c.idDiscussion AND
      c.idAppUser=${idSender} AND
      a.id=${idReceiver} AND
      (b.objectId IS NULL OR
        b.objectId='' OR b.objectId=0)
      ORDER BY createdDate DESC`
      // let q2 = `select name from appUser where id=${idSender}`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.strategyProgressPercentage = (idBusinessStrategy) => {
  return new Promise(function(resolve, reject) {
      let query = `select b.idBusinessStrategy, sum(progressPercentage) as sum
      from businessStrategyProgress a, businessStrategyHasBusinessStrategyProgress b
      where 
      a.id=b.idBusinessStrategyProgress`
      if(idBusinessStrategy != null){
       query = query + ` and b.idBusinessStrategy=${idBusinessStrategy}`
      }
      query = query + ` GROUP BY b.idBusinessStrategy`
      
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.discussionReadBy = (idDiscussion) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT c.name, b.id, a.readFlag
      FROM discussionHasAppUser  a, discussion b, appUser c 
      WHERE 
      a.idDiscussion=b.id AND
      a.idAppUser=c.id AND 
      b.id=${idDiscussion}`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.unreadMessagesCount = (idAppUser) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT count(*) messages
      FROM discussionHasAppUser
      WHERE
      idAppUser=${idAppUser}
      and readFlag=0`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.strategicChoiceOptionsCount = (idBusinessStrategy) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT a.id, a.name, a.shortDescription, a.longDescription, a.objectStatus, a.evaluationModel, a.strategicChoiceType,
      a.strategicChoiceSubType, a.orderBy, a.archivedFlag, a.idBusinessStrategy, a.idBusinessDisruption,
      a.idAppRole, COUNT(b.id) numOfOptions, c.name AS appRoleName
      FROM strategicChoice a LEFT JOIN choiceOption b
      ON
      a.id=b.idStrategicChoice LEFT JOIN appRole c
      ON a.idAppRole=c.id 
      WHERE a.idBusinessStrategy=${idBusinessStrategy}
      GROUP BY a.id, a.name, a.shortDescription, a.longDescription, a.objectStatus, a.evaluationModel, 
      a.strategicChoiceType, a.strategicChoiceSubType, a.orderBy, a.archivedFlag, a.idBusinessStrategy, a.idBusinessDisruption,
      a.idAppRole, c.name`
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.businessOutcomeChart = (idBusinessOutcome) => {
  return new Promise(function(resolve, reject) {
    // TIMESTAMPDIFF(MONTH,startDate,targetDate) monthDiff,
    // DateAdd(mm, 1, targetDate)
    let query = `SELECT *, 
    ROUND(DATEDIFF(DAY,startDate, targetDate)/30, 0) monthDiff,
    ROUND(targetValue-startValue, 2) as valueDiff
    FROM businessOutcome
    WHERE id=${idBusinessOutcome}`
    db.sequelize.query(query).then(([results, metadata]) => {
      let dataArray = []
      let increment = results[0].valueDiff/results[0].monthDiff
      let { startValue, targetValue } = results[0]
      let startDate = moment(results[0].startDate)
      let currentDate = startDate
      let targetDate = moment(results[0].targetDate)
      let currentValue = +startValue
      while (currentDate <= targetDate) {
        dataArray.push({ name: currentDate.format('MMM YYYY'), value: currentValue} )
        currentDate = currentDate.add(1, 'months')
        currentValue += increment
        currentValue = +parseFloat(currentValue).toFixed(2)
      }
      dataArray[dataArray.length -1].value = targetValue
      if(dataArray[dataArray.length -1].name != targetDate.format('MMM YYYY')){
        dataArray.push({ name: targetDate.format('MMM YYYY'), value: targetValue})
      }
      let dateCondition = ` AND dateOfMeasurement > '${startDate}' AND dateOfMeasurement < '${targetDate}'`
      
      let query2 = `select format(dateOfMeasurement, 'MMM yyyy') as name, Round(AVG(CAST(value AS FLOAT)),2) value from 
      kpiData
      where idKpi=${results[0].idKpiPrimary}
      group by format(dateOfMeasurement, 'MMM yyyy')
      order by CAST(format(dateOfMeasurement, 'MMM yyyy') AS DATE) asc`
      db.sequelize.query(query2).then(([results2, metadata]) => {
        let array = []
        array.push({ name: "Target", series: dataArray})
        array.push({ name: "Actual", series: results2})
        resolve(array)
      })
      .catch(error =>{
        reject(error);

      }); 
    })
    .catch(error =>{
      reject(error);
    });
  });
}

exports.kpiDataSeries = (idKpi, limit, fromDate, toDate) => {
  return new Promise(function(resolve, reject) {
      let limitCondition = "";
      if(limit != null){
        limitCondition = ` TOP ${limit}`;
      }
      let dateCondition = "";
      if(fromDate != null && toDate != null){
        dateCondition = ` AND dateOfMeasurement > '${fromDate}' AND dateOfMeasurement < '${toDate}'`
      }
      let query = `SELECT ${limitCondition} format(dateOfMeasurement, 'dd MMM yyyy') as name, value
      from kpiData
      where idKpi= ${idKpi}  ${dateCondition}
      ORDER BY dateOfMeasurement ASC
      `;
      db.sequelize.query(query).then(([results, metadata]) => {
        let array = []
        array.push({ name: "Kpi Data Series", series: results})
        resolve(array);
  })
  .catch(error =>{
    reject(error);

  });
  });
}

exports.businessStrategyGlossaries = (id) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT *, a.shortDescription as glossaryShortDescription
      FROM glossary a, businessStrategyHasGlossary b
      WHERE a.id=b.idGlossary
      AND b.idBusinessStrategy=${id}`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}
exports.businessStrategyStakeholders = (id) => {
  return new Promise(function(resolve, reject) {
    let query = `SELECT a.*, b.*, c.name as stakeholderName, a.shortDescription as appRoleShortDescription
    FROM appRole a, businessStrategyHasAppRole b, stakeholder c
    WHERE a.id=b.idAppRole
    AND a.idStakeholder=c.id
    AND b.idBusinessStrategy=${id}`;
    db.sequelize.query(query).then(([results, metadata]) => {
    resolve(results);
    })
    .catch(error =>{
      reject(error);

    });
  });
}
  
exports.getAllBusinessCapability = () => {
  return new Promise(function(resolve, reject) {
    let query = `Select z.*  , a.name as businessCapabilityName, b.name as appRoleName from businessCapability as z LEFT JOIN  businessCapability as a
    ON z.idBusinessCapabilityParent = a.id   LEFT JOIN  appRole as b
    ON z.idAppRoleOwner = b.id` 

    db.sequelize.query(query).then(([results, metadata]) => {
    resolve(results);
    })
    .catch(error =>{
      reject(error);
    });
  });
}


exports.bookCustomerOrder = (req, res) => {
  return new Promise(function(resolve, reject) {

      const myJSON = JSON.stringify(req.body.order_items);
      let hash = md5(new Date() + req.user.id);
      let query = `INSERT INTO booking_order (total_amount, discounted_amount,order_items,customer_id,hash)
      VALUES (${req.body.total_amount}, ${req.body.discounted_amount}, '${myJSON}', ${req.user.id},'${hash}' )`;
      db.sequelize.query(query).then(([res, metadata]) => {

            let query1 = `Select id,name,email from provider where city_id = '${req.user.city_id}' `; 
            db.sequelize.query(query1).then(([results, metadata]) => {
              if(results != 0){
                    results.forEach((item, i) => {
                      let query = `INSERT INTO notification (customer_id, provider_id,booking_order_id)
                      VALUES (${req.user.id}, ${item.id}, "${res}" )`;
                      db.sequelize.query(query).then(([results, metadata]) => {
                        /* Sending Mail */
                        //(customer_name, vendor_name, order_id)

                        mailService.orderRequestToProviders(req.user.name, item.name,item.email, res,hash)                        
                      
                      });

                    });
                    
                        resolve(results);   
              }else{
                        resolve(results);
              }
            });
      })
      .catch(error =>{
        reject(error);
      });

    });
}

exports.customerStripeAccount = (req,res) =>{
  return new Promise(function(resolve, reject) {
      let query = `Select s_account,email from customer where id = '${req.user.id}'   `;
      db.sequelize.query(query).then(([results, metadata]) => {
          if(results.length !== 0){
              resolve(results);
          }else{
                reject("No orders found");
          }
        })
        .catch(error =>{
          reject(error);
        })            
  })

};


exports.updateCustomerStripeAccount = (req,account,token,pan) =>{
  return new Promise(function(resolve, reject) {
      let query = `update customer  set s_id = '${account}' , s_token = '${token}' , pan = '${pan}' , s_account = 1 WHERE id  = '${req.user.id}'   `;
      db.sequelize.query(query).then(([results, metadata]) => {
              resolve(results);
        })
        .catch(error =>{
          reject(error);
        })            
  })

};


exports.getCustomerOrder = (req,res) => {
  return new Promise(function(resolve, reject) {


    let status = (typeof req.query.status == 'undefined')? '' : striptags(decodeURI(req.query.status));
    if(status != ""){
        status = `AND booking_order.status = '${status}' `;
    }

      let query = `Select booking_order.*,provider.name AS provider_name from booking_order 
      left join provider ON provider.id = booking_order.provider_id 
      WHERE booking_order.customer_id = '${req.user.id}' ${status}  `;
      db.sequelize.query(query).then(([results, metadata]) => {
          if(results.length !== 0){
              resolve(results);
          }else{
                reject("No orders found");
          }
        })
        .catch(error =>{
          reject(error);
        })            
  })
}



exports.getCustomerServices = (req,res) => {
  return new Promise(function(resolve, reject) {

      let query = `Select * from services `;
      db.sequelize.query(query).then(([results, metadata]) => {
              resolve(results);
        })
        .catch(error =>{
          reject(error);
        })            
  })
}




exports.customerForgetPassword = (data,res) => {
  return new Promise(function (resolve, reject) {

    
    
    let email = (typeof data == 'undefined')? '' : striptags(decodeURI(data.trim()));
    if (validation.isEmpty(email)) {
      return  responseHandler.resHandler(false, {}, 'Email address required', res, 400);
    }
    else if (!validation.validateEmail(email)) {
      return  responseHandler.resHandler(false, {}, 'Invalid email address', res, 400);
    }

    let query = `select  * from users WHERE email = '${email}' `;
    db.sequelize.query(query).then(([results, metadata]) => {

      if(results.length !== 0){        
            
        let passwordHash = md5(results[0].email + results[0].id);

        const link = config.baseUrl +"api/v1/users/forget-password/"+ encodeURIComponent(passwordHash);
        let query1 = ` UPDATE users SET hash = '${passwordHash}' where id = '${results[0].id}' `;
        db.sequelize.query(query1).then(([results1, metadata]) => {

          const name = results[0].full_name;
        
            /* Sending Mail */
            mailService.forgotPassword(results[0].email, name, link)
            resolve('Password reset instructions has been successfully sent');
          }).catch(error => {
            reject(error);
          });
      }else{
        reject('Unable to send password reset instructions');
      }
    })
    .catch(error =>{
      reject(error);
    });
  });

}


exports.customerVerifyResetPasswordToken = (data) => {
  return new Promise(function (resolve, reject) {
    let hash = (typeof data == 'undefined')? '' : striptags(decodeURI(data.trim()));
    if (validation.isEmpty(hash)) {
      return  responseHandler.resHandler(false, {}, 'Verification token required', res, 400);
    }

    let query = `select  * from users where hash  = '${hash}' `;
    db.sequelize.query(query).then(([results, metadata]) => {
      if(results.length !== 0){
        resolve(results[0].hash)
      }else{
        reject('Invalid request');
      }
    })
    .catch(error =>{
      reject(error);
    });


    
  })
}

exports.customerResetPassword = (data) => {
  return new Promise(function (resolve, reject) {

// Create a schema
var schema = new passwordValidator();
// Add properties to it
schema
.is().min(8)                                    // min length 8
//.has().uppercase(1)                              // Must have 1 uppercase letters
//.has().digits(1)                                // Must have at least 1 digits
//.has().not().spaces();                           // Should not have spaces



    let hash = data.passwordHash;
    if (validation.isEmpty(data.passwordHash)) {
      return  responseHandler.resHandler(false, {}, 'Verification token required', res, 400);
    }
    let password = (typeof data.password == 'undefined')? '' : striptags(decodeURI(data.password.trim()));
    if (validation.isEmpty(password)) {
      return  responseHandler.resHandler(false, {}, 'Password required', res, 400);
    }

 if(schema.validate(password) == false){
  reject('Invalid password');
 };
 password = (typeof data.password == 'undefined')? '' : striptags(decodeURI(data.password.trim()));

    let query = `select  *from users where hash  = '${hash}' `;

    db.sequelize.query(query).then(([results, metadata]) => {
      if(results.length !== 0){
                        
        bcrypt.hash(password, saltRounds).then(function(hash) {
          password = hash;

              if(results[0].password == password){

                reject("Current password can't be used as new password");
              }else{

              let query1 = `UPDATE users SET hash = 'null', password = "${password}" where id = "${results[0].id}" `;
              db.sequelize.query(query1).then(([results, metadata]) => {
                if(results.length !== 0){

                  resolve('Password successfully changed');
                }else{
                  reject('Invalid request');
                }
              })
              .catch(error =>{
                reject(error);
              });
            }
          })
      }else{

        reject('Invalid Request.');
      }

    })
    .catch(error =>{



      reject(error);
    });



  })
}




exports.getTableData = (req,res) => {
  return new Promise(function(resolve, reject) {

    var res = {};
    let pagein = "";
    var limit  = 10;
    var offset = 0;
      
    if(req.query.limit!==undefined){
        limit = req.query.limit;
    }
    if(req.query.page!==undefined){
        offset = (req.query.page-1)*limit;
    }
    pagein = `LIMIT ${offset},${limit} `;

    
  let query = `Select count(*) AS count from ${req.params.table} ${pagein} `;
  db.sequelize.query(query).then(([count, metadata]) => {


if(count[0].count>0){
  let query = `Select *from ${req.params.table} ${pagein} `;
  db.sequelize.query(query).then(([results, metadata]) => {
      if(results.length !== 0){
        res.total_rows = count[0].count;
        res.records =   results;
        resolve(res);
      }else{
            reject("No records found");
      }
    })
    .catch(error =>{
      reject(error);
    })            

}else{

  reject("No records found");
}




    })

  })
}




exports.getTableDataById = (req,res) => {
  return new Promise(function(resolve, reject) {

    var key = "id";
    var value = 0;
    if(req.query.key!==undefined){
        key = req.query.key;        
    }

    if(req.params.value !==undefined){
      value = req.params.value;        
    }


        let query = `Select count(*) AS count from ${req.params.table} where ${key} = '${value}' `;    
      console.log(query);
        db.sequelize.query(query).then(([count, metadata]) => {


      if(count[0].count>0){
        let query = `Select *from ${req.params.table} where ${key} = '${value}' `;
        db.sequelize.query(query).then(([results, metadata]) => {
            if(results.length !== 0){
              resolve(results);
            }else{
               
              reject("Invalid id");
            }
          })
          .catch(error =>{
            reject(error);
          })            

      }else{

        reject("Invalid id");
      }

    })

  })
}




 customPost = (data,table) => {
  return new Promise(async function(resolve, reject) {

    let dataKeys = ""; 
    let dataValues = ""; 
    Object.keys(data).forEach((key,i)=>{
       
     dataKeys  += (i < Object.keys(data).length-1)? `${key}`+','   : `${key}` ;
     let s = data[key];
     if(typeof s == "string"){
       s =  s.replace(/'/g, "");
       s =  s.replace(/`/g, "");
 
     }
     s = (s == 'undefined' || s == undefined)? '' : s;
     if(i < Object.keys(data).length-1){
       dataValues += `'${s}',`;
     }else{
       dataValues += `'${s}'`;
 
     }
 
    });    
    let query = `INSERT INTO ${table} (${dataKeys})
    VALUES (${dataValues})`;
    console.log(query);
    db.sequelize.query(query).then(([results, metadata]) => {
            if(results != 0){              
                      resolve("Added Successfully");   
            }else{
                      reject("Unable to Add");
            }
    })
    .catch(error =>{
      reject(error);
    });

  });
}



exports.postTableData = (req, res) => {
  return new Promise(async function(resolve, reject) {
    var keys = "";
    var values = "";

    
    if(req.body.password){
      await bcrypt.hash(req.body.password, saltRounds).then(function(hash){
         req.body.password = hash; 
       })
     } 

      Object.entries(req.body).forEach(([key, value]) => {
        keys==""?keys += `${key}`:keys +=`,${key}`;
        values==""?values += `'${value}'`:values +=`,'${value}'`;
      });
    
    
      let query = `INSERT INTO ${req.params.table} (${keys})
      VALUES (${values})`;
      console.log(query);
      db.sequelize.query(query).then(([results, metadata]) => {
              if(results != 0){              
                        resolve("Added Successfully");   
              }else{
                        reject("Unable to Add");
              }
      })
      .catch(error =>{
        reject(error);
      });

    });
}


exports.putTableData = (req, res) => {
  return new Promise(async function(resolve, reject) {
    var key = "id";
    var value = 0;
    if(req.query.key!==undefined){
        key = req.query.key;        
    }
    if(req.params.value !==undefined){
      value = req.params.value;        
    }
    var keys = "";


    
      if(req.body.password){
        await bcrypt.hash(req.body.password, saltRounds).then(function(hash){
          req.body.password = hash; 
        })
      } 

      Object.entries(req.body).forEach(([k, v]) => {
        keys==""?keys += `${k} = '${v}' `:keys +=`,${k} = '${v}'`;
      });
    
      
      let query = `Select count(*) AS count from ${req.params.table} where ${key} = ${value} `;    
      console.log(query);
        db.sequelize.query(query).then(([count, metadata]) => {


      if(count[0].count>0){

        let query = `UPDATE ${req.params.table} SET ${keys} where ${key} = ${value} `;
        db.sequelize.query(query).then(([results, metadata]) => {
            if(results.length !== 0){
              resolve(results);
            }else{
               
              reject("Invalid id");
            }
          })
          .catch(error =>{
            reject(error);
          })            

      }else{

        reject("Invalid id");
      }

    })

    });
}



exports.deleteTableData = (req, res) => {
  return new Promise(async function(resolve, reject) {
    var key = "id";
    var value = 0;
    if(req.query.key!==undefined){
        key = req.query.key;        
    }
    if(req.params.value !==undefined){
      value = req.params.value;        
    }
      
      let query = `Select count(*) AS count from ${req.params.table} where ${key} = ${value} `;    
      console.log(query);
        db.sequelize.query(query).then(([count, metadata]) => {


      if(count[0].count>0){

        let query = `DELETE FROM ${req.params.table} where ${key} = ${value} `;
        db.sequelize.query(query).then(([results, metadata]) => {
            if(results.length !== 0){
              resolve("Deleted successfully ");
            }else{
               
              reject("Invalid id");
            }
          })
          .catch(error =>{
            reject(error);
          })            

      }else{

        reject("Invalid id");
      }

    })

    });
}




exports.getOrderById = (req,res) => {
  return new Promise(function(resolve, reject) {

    if(req.params.value !==undefined){
      value = req.params.value;        
    }


        let query = `Select * from booking_order bo 
        inner join customer AS c ON c.id = bo.customer_id 
        where bo.id = ${value} `;    
      console.log(query);
        db.sequelize.query(query).then(([count, metadata]) => {


      if(count.length >0){
        let query = `Select c.full_name AS customer_name,
        p.name AS provider_name, bo.*  from booking_order bo  
        inner join customer AS c ON c.id = bo.customer_id  
        left join provider AS p ON p.id = bo.provider_id  
        where bo.id = ${value} `;
        db.sequelize.query(query).then(([results, metadata]) => {
            if(results.length !== 0){
              resolve(results);
            }else{
               
              reject("Invalid id");
            }
          })
          .catch(error =>{
            reject(error);
          })            

      }else{

        reject("Invalid id");
      }

    })

  })
}






 const getpvk = `-----BEGIN RSA PRIVATE KEY-----
  MIICXAIBAAKBgQCEwgpuZtDwMLti4NaY8veobbFdOZ0XxXmG4L06DfZ6tbCrlgWa
  eZxS/7BQWK2GIq7Jeu5XASfFmxl6V1qGrSdcnPXjRJZU28sRUO7EIfM3Szp8z9+P
  EO0iNnFyIEjHCzymHbi0wiTEClLJVBUy1rQvPIb5dgfij3wDNZ3Ub/OT8QIDAQAB
  AoGALUUt4W/WF9HGVHVvOEDCCwE81hlrZEvGoSPJ4x4XyshiMmC6EG8fy329Vein
  Y3I4QCRXWfve4Bd/nKRlDj/Fh+WGDlz1mGXuuSuyHI8J0r8M+v92/3tAcEzdTpfL
  ty6T+39sctgGog5CT8JMfCFiPGdr0vCrDT9e3cOAkTBTzwECQQC9u9ifxxndGgOe
  F9xrVwFsoRcIXYDykK0MJQJ9SGM79F8KP81d66KeW99ayYMYFyzhbqYLvhU8OTqd
  ZU0dpKeJAkEAsx/4jk/hGaTr2vDWMlgxL5FDi9Ogw8ZO+1BiA+58V+Ien4vwdWOV
  G9Hp4AuxayWUgTcXHAyzgB40qI1VsAAHKQJARyG3sx836RapqImVj4CM/ibetboo
  b8ghuF3fswyCd6XEQ9lrqvx+eRREhorp5Qw7PUD4a4qV94AVI5Eo+iYS0QJAMDdV
  57DWzdlX53pWnfyhWMWIYhYYOzqhPgLYL2i9rcZfKeE4W9DvbSqnArkDC+10uQeE
  P/enRcBbulc5DoQjaQJBAKXVNj0hjKMJE6olg4uFgUa2K6bxS5a/HBGb1oenyovX
  TMGVha2mDFmMqyI/lrpVn9nlkyrhIt0zRy+N6+7zdww=
  -----END RSA PRIVATE KEY-----`;  

  


exports.getpvk = getpvk;

exports.createCommon = (req, res) => {
  return new Promise(function (resolve, reject) {
    imagesUpload.uploadImage(req, res, function (err) {
      if (err) {
        // return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      if (req.fileValidationError) {
        //fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
        // return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      if (typeof req.file == "undefined") {
        // fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
        //return responseHandler.resHandler(false, null, 'No data found', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      if (req.file.size > 15728640) {
        fs.unlinkSync(`${config.fileConfiguration}/${req.file.filename}`);
        //  return responseHandler.resHandler(false, null, 'The file size is too large. Please upload a photo of maximum up to 15MB.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      req.body.profile_picture = req.file.filename;
      let table = req.params.table;
      req.body.userId = req.user.id;
      
      let requireFile = `../../common/models/${table}Model`;
      let Model = require(requireFile);
      let model = new Model(req.body);
      let data = model.validateSchema();
      if(data.error){
        return responseHandler.resHandler(false, {}, data.error.details[0].message, res, 400);
    
      }else{
        let dataKeys = ""; 
        let dataValues = ""; 
        Object.keys(data.value).forEach((key,i)=>{
           
         dataKeys  += (i < Object.keys(data.value).length-1)? `${key}`+','   : `${key}` ;
         let s = data.value[key];
         if(typeof s == "string"){
           s =  s.replace(/'/g, "");
           s =  s.replace(/`/g, "");
     
         }
         s = (s == 'undefined' || s == undefined)? '' : s;
         if(i < Object.keys(data.value).length-1){
           dataValues += `'${s}',`;
         }else{
           dataValues += `'${s}'`;
     
         }
        });
        
           let query = "INSERT INTO "+table+" ("+dataKeys+" ) VALUES ("+dataValues+") ";
          // console.log("query",query);
          db.sequelize.query(query).then(([results, metadata]) => {
            resolve(results);
        })
       .catch(err =>{
         console.log("bbb",err);
         let error = {};
         error = {
           "errorCode" : 1001,
           "errorMessgae" : "Name is not unique , Please provide  unique name"
         };
         if(err.stack.indexOf('SequelizeUniqueConstraintError') == 0){
           reject(error);
     
        }else{
          error = {
           "errorCode" : 1005,
           "errorMessgae" : err.stack
         };
     
           reject(error);
     
        }  
     
       });        
      }
    });
  });
};



exports.editCommon = (req, res,id,fk,resource) => {
  return new Promise(function (resolve, reject) {
    imagesUpload.uploadImage(req, res, function (err) {
      if (err) {
        // return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      if (req.fileValidationError) {
        //fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
        // return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
            /*

      if (typeof req.file == "undefined") {
        // fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
        //return responseHandler.resHandler(false, null, 'No data found', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      if (req.file.size > 15728640) {
        fs.unlinkSync(`${config.fileConfiguration}/${req.file.filename}`);
        //  return responseHandler.resHandler(false, null, 'The file size is too large. Please upload a photo of maximum up to 15MB.', res, 400);
        reject({ message: "bad request", code: 400 });
      }
      */

     if(typeof req.file != "undefined"){
      req.body.profile_picture = req.file.filename;

     }
      let table = req.params.table;
      req.body.userId = req.user.id;
      
      let requireFile = `../../common/models/${table}Model`;
      let Model = require(requireFile);
      let model = new Model(req.body);
      let data = model.validateSchema();
      if(data.error){
        return responseHandler.resHandler(false, {}, data.error.details[0].message, res, 400);
    
      }else{
 

        let dataKeyValue = "";
        data.value.userId = undefined; 
        Object.keys(data.value).forEach((key,i)=>{
         let s = data.value[key];
         if(typeof s == "string"){
           s =  s.replace(/'/g, "\\'");
         }
         if(key === 'lastUpdateDate'){
              s = date;
           }
           if(key === 'idUserLastUpdateBy'){
                 s = req.user.id;
           }
           if(key === 'idOrganization'){
             s = req.user.idOrganization;
           }
           if(key != "createdDate" && key != "idUserCreatedBy"){
     
         if(i < Object.keys(data.value).length-1){
           if(s != undefined){
             dataKeyValue += ` ${key}  = '${s}',`;
     
           }
     
         }else{
           if(s != undefined){
             dataKeyValue += ` ${key}  = '${s}'`;
     
           }
     
     
         }
       }
        });
          if(dataKeyValue[dataKeyValue.length-1] == ","){
           dataKeyValue = dataKeyValue.replace(/,\s*$/, ""); 
          }
           let query = "UPDATE "+resource+" SET "+dataKeyValue+" WHERE  id =  '"+id+"' AND  "+fk+" = "+req.user.id+"  ";
     //      console.log("query",query);
           db.sequelize.query(query).then(([results, metadata]) => {
       
             resolve(results);
       })
       .catch(error =>{
         console.log("edit eror");
         reject(error);
     
       });
             
      }
    });
  });
};


exports.notesSearch = (profileId,q,req,res) => {
  return new Promise(function(resolve, reject) {
      let query = `SELECT * FROM notes WHERE profileId = '${profileId}' AND title  LIKE '%${q}%'`;
      db.sequelize.query(query).then(([results, metadata]) => {
      resolve(results);
  })
  .catch(error =>{
    reject(error);

  });
  });
}


exports.socialLogin = (data,res) => {
  return new Promise(function(resolve, reject) {

    let full_name = (typeof data.full_name == 'undefined')? '' : striptags(decodeURI(data.full_name.trim()));
    let email = (typeof data.email == 'undefined')? '' : striptags(decodeURI(data.email.trim()));
    let social_type = (typeof data.social_type == 'undefined')? '' : striptags(decodeURI(data.social_type.trim()));
    let social_id = (typeof data.social_id == 'undefined')? '' : striptags(decodeURI(data.social_id.trim()));

    if (validation.isEmpty(full_name)) {
        return  responseHandler.resHandler(false, {}, 'full_name required', res, 400);
    }
    else if (validation.isEmpty(email)) {
      return  responseHandler.resHandler(false, {}, 'email required', res, 400);
    }
    else if (!validation.validateEmail(email)) {
      return  responseHandler.resHandler(false, {}, 'invalid email', res, 400);
    }
    else if (validation.isEmpty(social_type)) {
      return  responseHandler.resHandler(false, {}, 'social type required', res, 400);
    }
    else if (validation.isEmpty(social_id)) {
      return  responseHandler.resHandler(false, {}, 'social id required', res, 400);
    }

    let businessObject  =   {
      full_name,
        email,
        social_type,
        social_id,
        is_social_login : 1

      };

      let dataKeys = "";
      let dataValues = "";
      Object.keys(businessObject).forEach((key,i)=>{
       dataKeys  += (i < Object.keys(businessObject).length-1)? `${key}`+','   : `${key}` ;
       if(i < Object.keys(businessObject).length-1){
         dataValues += `'${businessObject[key]}',`;
       }else{
         dataValues += `'${businessObject[key]}'`;
       }

      });

          let query0 = `SELECT  (SELECT COUNT(id) FROM profile WHERE userId = u.id ) as profileCount , u.* FROM users as u where u.email = '${email}' `;
          db.sequelize.query(query0).then(([results1, metadata1]) => {

              if(results1 != 0){
                  let result = results1[0];

                  let signData = {
                    id: result.id,
                    packageId : result.packageId,
                    full_name: result.full_name,
                    email: result.email,
                    created_date: result.created_date,
                    profileCount : result.profileCount 
                  };
                      console.log(signData)
                      const token = jwt.sign(signData, config.secrets.key); //get the private key from the config file -> environment variable

                    let data = {
                      userData: signData , token
                    }
                    resolve(data);

              }else{

                  let query = "INSERT INTO users ("+dataKeys+" ) VALUES ("+dataValues+") ";
                  db.sequelize.query(query).then(([results, metadata]) => {
                      console.log("results",results);
                    let signData = {
                      id: results,
                      packageId : 0,
                      full_name: full_name,
                      email: email,
                      profileCount : 0 
                     };
                    console.log(signData)
                    const token = jwt.sign(signData, config.secrets.key); //get the private key from the config file -> environment variable

                      let data = {
                        userData: signData , token
                      }
                      resolve(data);
                  })
                  .catch(error =>{
                    if(error.stack.indexOf('SequelizeUniqueConstraintError') == 0){
                      reject('Duplication Entry');
                    }else{
                      reject(error.stack);
                    }
                  });

            }
          });
  });
}
