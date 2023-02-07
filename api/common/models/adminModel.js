const Joi = require('joi');
class adminModel {
  constructor(body)
    {
      
     this.name = body.name 
    this.email = body.email 
    this.password = body.password 
    this.phone = body.phone 

  //  this.type = body.type 
  //  this.status = body.status 
    this.image = body.image 

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     name : Joi.string().required(), 
    email : Joi.string().required(), 
    password : Joi.string().required(), 
    phone : Joi.string().optional().allow(''),
 //   type : Joi.number().required(), 
  //  status : Joi.number().required(), 
//    created_by : Joi.number().required(), 
    image : Joi.string().required(), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = adminModel;      
      