/*
** Load Node Modules **
*/
const express = require('express');
const app = express();
const sanitizer = require('sanitize')();

app.use(require('sanitize').middleware);

/* ## Database Library */
const db = require('../../config/dbConnection')

const bcrypt = require('bcrypt');
const saltRounds = 10;
const config = require('../../config/environment');
const tableJson = require('../../sql/table.json')


/** Services   */
const Service = require('./services/service');

/* ## Include libraries  */
const validation = require('../../lib/service/validation');
const responseHandler = require('../../lib/service/responseHandler');
const striptags = require('striptags');
const { result } = require('lodash');
const { array, meta } = require('joi');
const imagesUpload = require('./../../lib/service/fileUpload');
const mailService = require('./../../lib/service/mail.service')
const jwt = require('jsonwebtoken');
const notification = require('./../../lib/service/notification')


exports.createCommon = (req, res, next) => {
  req.body.userId = req.user.id;
  Service.createCommon(req, res)
    .then((results) => {
      return responseHandler.resHandler(true, results, {}, res, 200);
    })
    .catch((error) => {
      return responseHandler.resHandler(false, {}, error.message, res, error.code);
    });
};

exports.editCommon = (req, res, next) => {
  req.body.userId = req.user.id;
  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let table =  tableJson[resource].table;
  let fk =  tableJson[resource].fk;


  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  
  }  
  let id = (typeof req.params.id == 'undefined')? '' : striptags(decodeURI(req.params.id.trim()));


  Service.editCommon(req, res,id,fk,resource)
    .then((results) => {
      return responseHandler.resHandler(true, {}, "Sucessfully updated", res, 200);
    })
    .catch((error) => {
      return responseHandler.resHandler(false, {}, error.message, res, error.code);
    });
};


exports.adminValidate = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  console.log("token ali",token);

  if (!token) {
    return responseHandler.resHandler(true, "No token provided", "No token provided", res, 400);
  }
  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.secrets.key);

    console.log("decoded",decoded);

    req.user = decoded;
    // Verify user exists in database
    Service.adminFindById(decoded).then(results => {
      let resp = {
        userData : results,
        token 
      }
      return responseHandler.resHandler(true,resp , {}, res, 200);
    })
      .catch(error => {
        //res.status(400).json({"error" :" 7Invalid token."});
        return responseHandler.resHandler(false, "2", error, res, 400);

      });

  } catch (ex) {
    //if invalid token
    console.log("ex",ex);
    return responseHandler.resHandler(false, "2", ex, res, 400);
  }
}

exports.getAll = (req, res, next) => {
  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let table =  tableJson[resource].table;
  let fk =  tableJson[resource].fk;

  let orderBy = (typeof req.query.orderBy == 'undefined')? null : striptags(decodeURI(req.query.orderBy.trim()));

  try{
    if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  
    }else{
      Service.getAllCount(table,orderBy,req.query,req.user,fk).then(count=>{
        Service.getAll(table,orderBy,req.query,req.user,fk).then(results => {
          return responseHandler.resHandler(true, {total: count[0]['total'],results

          }, {}, res, 200);
             
            })
            .catch(error =>{
              return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error, res, 500);
 
            })
            .catch(error =>{
              return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error, res, 500);
              
            })


          })

        }
      }
    catch(e){
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + e, res, 500);
      
    }

}




exports.getSingle = (req, res, next) => {



  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let id = (typeof req.params.id == 'undefined')? '' : striptags(decodeURI(req.params.id.trim()));
  let table =  tableJson[resource].table;
  let fk =  tableJson[resource].fk;
  
  let orderBy = (typeof req.query.orderBy == 'undefined')? null : striptags(decodeURI(req.query.orderBy.trim()));

  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  }  
  if (validation.isEmpty(id)) {
    return responseHandler.resHandler(false, {}, 'id required', res, 400);
  }
  else if (id.length > 11) {
    return responseHandler.resHandler(false, {}, 'id Should be minimum less than 11', res, 400);
  }
  Service.getSingle(table,id,orderBy,fk)
    .then(resp =>{
      if(resp.length === 0){
        return responseHandler.resHandler(true, resp, 'No record found.', res, 200);

      }
      return responseHandler.resHandler(true, resp, {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

}

/*
** Function Name : create
** Method  : POST
** Description : this method will create new resource .
** Params : whole body.
*/

exports.create = (req, res, next) => {
  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let table =  tableJson[resource].table;
  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  
  }  
  console.log("req.body in  POST",req.body);
  console.log("req.params in  POST",req.params);
  console.log("req.query in  POST",req.query);

  req.body.userId = req.user.id;
  
  let requireFile = `./models/${table}Model`;
  let Model = require(requireFile);
  let model = new Model(req.body);
  let data = model.validateSchema();
  if(data.error){
    return responseHandler.resHandler(false, {}, data.error.details[0].message, res, 400);

  }else
    {
    Service.create(data,table,req.user)
    .then(resp =>{
      console.log("im in sucess :)");

      data.value.id = resp;
      return responseHandler.resHandler(true, data.value, {}, res, 200);
    })
    .catch(error=>{
      console.log("im in here :(",error);
      return responseHandler.resHandler(false, {},  error, res, 500);
    });

  }

}


exports.edit = (req, res, next) => {

  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let table =  tableJson[resource].table;
  let fk =  tableJson[resource].fk;
    console.log("fk",fk);
  req.body.userId = req.user.id;

  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  
  }  
  let requireFile = `./models/${table}Model`;
  let Model = require(requireFile);
  let id = (typeof req.params.id == 'undefined')? '' : striptags(decodeURI(req.params.id.trim()));
  if (validation.isEmpty(id)) {
    return responseHandler.resHandler(false, {}, 'Id required', res, 400);
  }
  else if (id.length > 11) {
    return responseHandler.resHandler(false, {}, 'id Should be minimum less than 11', res, 400);
  }
  let model = new Model(req.body);
  let modelResp = model.validateSchema();
  if(modelResp.error){
    return responseHandler.resHandler(false, {}, modelResp.error.details[0].message, res, 400);

  }else{
    Service.edit(modelResp,table,id,req,fk)
    .then(resp =>{
      modelResp.value.id = id
      return responseHandler.resHandler(true, modelResp.value, {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

  }

}


/*
** Function Name : softDelete 
** Method  : POST
** Description : this method will delete resource .
** Params : resource and Id .
*/

exports.softDelete = (req, res, next) => {

  let resource = (typeof req.params.resource == 'undefined')? '' : striptags(decodeURI(req.params.resource.trim()));
  let id = (typeof req.params.id == 'undefined')? '' : striptags(decodeURI(req.params.id.trim()));
  let table =  tableJson[resource];
  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  }  
  if (validation.isEmpty(id)) {
    return responseHandler.resHandler(false, {}, 'id required', res, 400);
  }
  else if (id.length > 11) {
    return responseHandler.resHandler(false, {}, 'Id Should be minimum less than 11', res, 400);
  }
  Service.softDelete(table,id)
    .then(resp =>{
      return responseHandler.resHandler(true, 'Successfully deleted', {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

}


 /*
** Function Name : delete 
** Method  : POST
** Description : this method will delete resource .
** Params : resource and Id .
*/

exports.delete = (req, res, next) => {

  let resource = (typeof req.params.table == 'undefined')? '' : striptags(decodeURI(req.params.table.trim()));
  let id = (typeof req.params.id == 'undefined')? '' : striptags(decodeURI(req.params.id.trim()));
  let table =  tableJson[resource].table;
  if(table == undefined){
      return responseHandler.resHandler(false, {}, 'Invalid resouce '+resource, res, 500);
  }  
  if (validation.isEmpty(id)) {
    return responseHandler.resHandler(false, {}, 'id required', res, 400);
  }
  else if (id.length > 11) {
    return responseHandler.resHandler(false, {}, 'Id Should be minimum less than 11', res, 400);
  }
  Service.delete(table,id)
    .then(resp =>{
      return responseHandler.resHandler(true, 'Successfully deleted', {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

}


 exports.registration = (req, res, next) => {
  
  let fullName = (typeof req.body.fullName == 'undefined')? '' : striptags(decodeURI(req.body.fullName.trim()));
  let email = (typeof req.body.email == 'undefined')? '' : striptags(decodeURI(req.body.email.trim()));
  let password = (typeof req.body.password == 'undefined')? '' : striptags(decodeURI(req.body.password.trim()));
  
  if(validation.isEmpty(fullName)){
    return responseHandler.resHandler(false, {}, 'fullName required', res, 400);
   }  
   else if(validation.isEmpty(email)){
    return responseHandler.resHandler(false, {}, 'email name required', res, 400);
   }  
   else if(!validation.validateEmail(email)){
    return responseHandler.resHandler(false, {}, 'invalid email address', res, 400);
   }  
   else if(validation.isEmpty(password)){
    return responseHandler.resHandler(false, {}, 'password required', res, 400);
   }  
  
   
 bcrypt.hash(password, saltRounds).then(function(hash) {
    let modelResp = {
      full_name : fullName,
      email,
      password : hash,
      hash : "",
      status : 0
    };
    console.log("modelResp",modelResp);
    Service.registration(modelResp)
      .then(resp =>{
        return responseHandler.resHandler(true, resp,"User successfully created", res, 200);
      })
      .catch(error=>{
        console.log('error',error);
        return responseHandler.resHandler(false, {},  error, res, 500);
      });
  

   })
   .catch(error =>{
     console.log("error",error);
    return responseHandler.resHandler(false, {},  error, res, 500);
 
   })


}

getPassword = getPassword = async (resp) =>{
  bcrypt.hash(resp, saltRounds).then(function(hash) {
    return  hash; 
});

}





exports.attachment = (req, res, next) => {

  imagesUpload.uploadFile(req, res, function (err) {
    console.log(err)
    if (err) {
      console.log('img err ', err);
      return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
    }
    if (req.fileValidationError) {
      //fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
      return responseHandler.resHandler(false, null, 'Unknown file format.', res, 400);
    }
    if (typeof req.file == 'undefined') {
      // fs.unlinkSync(`${config.imageConfiguration.path}/${req.file.filename}`);
      return responseHandler.resHandler(false, null, 'File required', res, 400);
    }
    
    let filePath =   config.imagePath;
    let fileName = req.file.filename;
    let fullPath = filePath+fileName;

    return responseHandler.resHandler(true, {fullPath,fileName}, {}, res, 200);

  });
}

    exports.themeIntersectionUpdate = (req, res, next) =>{
      Service.themeIntersectionUpdate(req.body).then(results => {
        return responseHandler.resHandler(true, "Operation successfully done", {}, res, 200);
      })
      .catch(error =>{
        return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error, res, 500);
      });
    
    }





    exports.passwordChange = (req, res, next) => {
      let userId = (typeof req.user.id == 'undefined')? '' : striptags(decodeURI(req.user.id));
      let oldPassword = (typeof req.body.oldPassword == 'undefined')? '' : striptags(decodeURI(req.body.oldPassword.trim()));
      let newPassword = (typeof req.body.newPassword == 'undefined')? '' : striptags(decodeURI(req.body.newPassword.trim()));
      
      if(validation.isEmpty(oldPassword)){
        return responseHandler.resHandler(false, {}, 'old password required', res, 400);
      }  
      if(validation.isEmpty(newPassword)){
        return responseHandler.resHandler(false, {}, 'new password required', res, 400);
      } 
      bcrypt.hash(newPassword, saltRounds).then(function(hash) {
         console.log('hash',hash);
        let modelResp = {
          password : hash
        };
          console.log('modelResp',modelResp);
        Service.validPassword(oldPassword, userId)
        .then((result) => {
          Service.passwordChange(modelResp,userId)
          .then(resp =>{
            return responseHandler.resHandler(true, "password successfully updated", {}, res, 200);
          })
          .catch(error=>{
            console.log('error',error);
            return responseHandler.resHandler(false, {},  error, res, 500);
          })
        })
        .catch(error=>{
          console.log('error',error);
          return responseHandler.resHandler(false, {},  error, res, 500);
        })
       })
       .catch(error =>{
    
       })
    
    
    }    

    exports.userPasswordChange = (req, res, next) => {
      let userId = (typeof req.params.userId == 'undefined')? '' : striptags(decodeURI(req.params.userId));
      let password = (typeof req.body.password == 'undefined')? '' : striptags(decodeURI(req.body.password.trim()));
      let userProfile = req.user.idUserProfile;
      if(validation.isEmpty(userId)){
        return responseHandler.resHandler(false, {}, 'user id', res, 400);
      }  
      if(validation.isEmpty(password)){
          return responseHandler.resHandler(false, {}, 'password required', res, 400);
      } 
      if(userProfile != 1){
        return responseHandler.resHandler(false, {}, 'You dont have permission to perform this action', res, 400);
      } 

      
     bcrypt.hash(password, saltRounds).then(function(hash) {
         console.log('hash',hash);
        let modelResp = {
          password : hash
        };
          console.log('modelResp',modelResp);
        Service.passwordChange(modelResp,userId)
          .then(resp =>{
            return responseHandler.resHandler(true, "password successfully updated", {}, res, 200);
          })
          .catch(error=>{
            console.log('error',error);
            return responseHandler.resHandler(false, {},  error, res, 500);
          });
      
    
       })
       .catch(error =>{
    
       })
    
    
    }       



  

  

exports.customerForgetPassword = (req, res, next) => {
  if (validation.isEmpty(req.body.email)) {
    return responseHandler.resHandler(false, {}, 'Enter your email address.', res, 400);
  }
  else if (validation.validateEmail(req.body.email) === false) {
    return responseHandler.resHandler(false, {}, 'Enter a valid email address.', res, 400);
  }

  Service.customerForgetPassword(req.body.email,res).then(resp => {
    return responseHandler.resHandler(true, {}, resp, res, 200);
  })
    .catch(error => {
      return responseHandler.resHandler(false, {}, error, res, 500);
    });
}

exports.customerVerifyResetPasswordToken = (req, res, next) => {
  let hash = decodeURIComponent(req.params.token);

  Service.customerVerifyResetPasswordToken(hash,res).then(resp => {
    return responseHandler.resHandler(true,{}, resp, res, 200);
  })
    .catch(error => {
      return responseHandler.resHandler(false, {}, error, res, 500);
    });
}

exports.customerResetPassword = (req, res, next) => {

  if (validation.isEmpty(req.body.password)) {
    return responseHandler.resHandler(false, {}, 'Please choose a password.', res, 400);
  } else if (validation.isEmpty(req.body.confirmPassword)) {
    return responseHandler.resHandler(false, {}, 'Please confirm password.', res, 400);
  } else if (req.body.password != req.body.confirmPassword) {
    return responseHandler.resHandler(false, {}, 'Password doesn\'t match.', res, 400);
  } else if (validation.isEmpty(req.body.passwordHash)) {
    return responseHandler.resHandler(false, {}, 'Invalid Request.', res, 400);
  }

  Service.customerResetPassword(req.body,res).then(resp => {
    return responseHandler.resHandler(true, {}, resp, res, 200);
  })
    .catch(error => {
      return responseHandler.resHandler(false, {},error, res, 500);
    });
}


exports.socialLogin = (req, res, next) => {
  let modelResp =  req.body;
  Service.socialLogin(modelResp,res)
    .then(resp =>{
      return responseHandler.resHandler(true, resp, "Login Successfully ", res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, error, res, 500);
    });
}


exports.login = (req, res, next) => {
  let email = (typeof req.body.email == 'undefined')? '' : striptags(decodeURI(req.body.email.trim()));
  let password = (typeof req.body.password == 'undefined')? '' : striptags(decodeURI(req.body.password.trim()));
  let rememberMe = (typeof req.body.rememberMe == 'undefined')? '' : striptags(decodeURI(req.body.rememberMe));
  let token = (typeof req.body.token == 'undefined')? '' : striptags(decodeURI(req.body.token));

 if(validation.isEmpty(email)){
  return responseHandler.resHandler(false, {}, 'email address required', res, 400);
 }  
 else if(!validation.validateEmail(email)){
  return responseHandler.resHandler(false, {}, 'invalid email address', res, 400);
 }  
 else if(validation.isEmpty(password)){
  return responseHandler.resHandler(false, {}, 'password required', res, 400);
 }  
    let modelResp = {
      email , password, rememberMe,token
    }
    Service.login(modelResp,req)
      .then(resp =>{
        return responseHandler.resHandler(true, resp, {}, res, 200);
      })
      .catch(error=>{
        console.log('error',error);
        return responseHandler.resHandler(false, {},  error, res, 500);
      });
 
}


exports.payment = (req, res, next) => {
  let token = (typeof req.body.token == 'undefined')? '' : striptags(decodeURI(req.body.token.trim()));
  let amount = (typeof req.body.amount == 'undefined')? '' : striptags(decodeURI(req.body.amount.trim()));
  let packageId = (typeof req.body.packageId == 'undefined')? '' : striptags(decodeURI(req.body.packageId.trim()));
 
 if(validation.isEmpty(token)){
  return responseHandler.resHandler(false, {}, 'token required', res, 400);
 }  
 else if(validation.isEmpty(amount)){
  return responseHandler.resHandler(false, {}, 'amount required', res, 400);
 }  
 else if(validation.isEmpty(packageId)){
  return responseHandler.resHandler(false, {}, 'packageId required', res, 400);
 }  

    let modelResp = {
      token , amount,packageId
    }
    console.log("modelResp",modelResp);
    Service.customerPackageUpdate(req,req.body.packageId).then(resp => {
      return responseHandler.resHandler(true, {}, "Payment succesfully charged", res, 200);
    })
      .catch(error => {
        console.log("error2",error);

        return responseHandler.resHandler(false, {},error, res, 500);
      });
  

    /*
    Service.login(modelResp,req)
      .then(resp =>{
        return responseHandler.resHandler(true, resp, {}, res, 200);
      })
      .catch(error=>{
        console.log('error',error);
        return responseHandler.resHandler(false, {},  error, res, 500);
      });
      */
 
}

exports.searchNotes = (req, res, next) => {


  
  let profileId = (typeof req.query.profileId == 'undefined')? null : striptags(decodeURI(req.query.profileId.trim()));
  let q = (typeof req.query.q == 'undefined')? null : striptags(decodeURI(req.query.q.trim()));

  if (validation.isEmpty(profileId)) {
    return responseHandler.resHandler(false, {}, 'id required', res, 400);
  }
  else if (profileId.length > 11) {
    return responseHandler.resHandler(false, {}, 'id Should be minimum less than 11', res, 400);
  }
  else if (validation.isEmpty(q)) {
    return responseHandler.resHandler(false, {}, 'search key required', res, 400);
  }

  Service.notesSearch(profileId,q,req,res)
    .then(resp =>{
      if(resp.length === 0){
        return responseHandler.resHandler(true, resp, 'No record found.', res, 200);

      }
      return responseHandler.resHandler(true, resp, {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

}



exports.customerTokenSave = (req, res, next) => {


  
  let token = (typeof req.body.token == 'undefined')? null : striptags(decodeURI(req.body.token.trim()));

  if (validation.isEmpty(token)) {
    return responseHandler.resHandler(false, {}, 'token required', res, 400);
  }
  Service.customerTokenUpdate(req,token)
    .then(resp =>{
      if(resp.length === 0){
        return responseHandler.resHandler(true, resp, 'No record found.', res, 200);

      }
      return responseHandler.resHandler(true, resp, {}, res, 200);
    })
    .catch(error=>{
      return responseHandler.resHandler(false, {}, 'Internal Server Error ' + error.stack, res, 500);
    });

}

exports.cron =  (req, res, next) => {

  Service.cron().then(resp => {

      if(resp.length > 0){
          
            resp.forEach(element => {
              console.log("element.a",element.a);
              if(element.a == 1 || element.a == 0){
                console.log("mmmmmmmmmmmmmmmmmmm");
                
                notification.sendPushNotification(element.uuids,{},element.remainder_name,"");
               
              }
                
            });
        

          
        
      }else{
        return responseHandler.resHandler(true, {}, "No data found on cron on datetime "+date, res, 200);

      }
    return responseHandler.resHandler(true, {}, resp, res, 200);
  })
    .catch(error => {
      console.log("error",error.stack);
      return responseHandler.resHandler(false, {},error, res, 500);
    });
}

