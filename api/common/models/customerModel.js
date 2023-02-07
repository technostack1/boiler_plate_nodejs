const Joi = require('joi');
class customerModel {
  constructor(body)
    {
      
     this.full_name = body.full_name 
    this.email = body.email 
    this.password = body.password 
    this.phone = body.phone 
    this.street_address = body.street_address 
    this.city_id = body.city_id 
    this.state = body.state 
    this.zip_code = body.zip_code 
    this.status = body.status 

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     full_name : Joi.string().required(), 
    email : Joi.string().required(), 
    password : Joi.string().required(), 
    phone : Joi.string().required(), 
    street_address : Joi.string().required(), 
    city_id : Joi.number().required(), 
    state : Joi.string().required(), 
    zip_code : Joi.string().required(), 
    status : Joi.number().required(), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = customerModel;      
      