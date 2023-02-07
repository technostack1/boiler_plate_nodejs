const Joi = require('joi');
class providerModel {
  constructor(body)
    {
      
     this.name = body.name 
    this.email = body.email 
    this.password = body.password 
    this.phone = body.phone 
    this.branch_name = body.branch_name 
    this.lat_long = body.lat_long 
    this.address = body.address 
    this.city_id = body.city_id 
    this.state = body.state 
    this.status = body.status 

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     name : Joi.string().required(), 
    email : Joi.string().required(), 
    password : Joi.string().required(), 
    phone : Joi.string().required(), 
    branch_name : Joi.string().required(), 
    lat_long : Joi.string().required(), 
    address : Joi.string().required(), 
    city_id : Joi.number().required(), 
    state : Joi.string().required(), 
    status : Joi.number().required(), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = providerModel;      
      