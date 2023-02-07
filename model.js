const express = require('express');
const app = express();
const server = require('http').createServer(app);
const env = app.get('env');
const fs = require('fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config/environment');
const mySqlCon = require('./config/dbConnection');
 
  let table = '';
  let excludedFields = ['id','deleted','created_date'];
  
  process.argv.forEach((element,i) => {
    if(i === 2){
       table = element;
    }
  });
  let fileNamePrefix = table+'Model.js';
  let dbType = config.dbConfig.dbType;
  let query = `DESCRIBE ${table}`
  let field = 'Field';

  mySqlCon.sequelize.query(query).then(result=>{
      let c = '\n ';
      let v  = '\n ';
	  console.log("result",result);
       if(result[0].length > 0){
        result[0].forEach((element,j) => {
          if(!excludedFields.includes(element[field])){
            
            let type = (element.Type === 'longtext' || element.Type.includes('varchar')  || element.Type === 'datetime2' )? 'string().' : 'number().';
          let validationType = (element.IS_NULLABLE === 'YES')? 'optional' : 'required'; 
            type = (validationType == 'optional')? '' : type;
          if(j == 0){
            c += `   this.${element[field]} = body.${element[field]} \n`;
            v += `   ${element[field]} : Joi.${type}${validationType}(), \n`; 

          }else{
            c += `    this.${element[field]} = body.${element[field]} \n`;
            v += `    ${element[field]} : Joi.${type}${validationType}(), \n`; 

          }
         } 

         });

let fileTemplate = `const Joi = require('joi');
class ${table}Model {
  constructor(body)
    {
      ${c}
    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          ${v}       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = ${table}Model;      
      `;   
      console.log('fileTemplate',fileTemplate);

      fs.writeFile(fileNamePrefix,fileTemplate,function(err) {
        if (err) throw err;
        console.log('Model file is created successully');
      })
       }
  })
  .catch(error =>{
      console.log('error',error);
  })


console.log('here is my tabele '+table);