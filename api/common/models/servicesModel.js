const Joi = require('joi');
class servicesModel {
  constructor(body)
    {
      
     this.service_name = body.service_name 
    this.description = body.description 
    this.price = body.price 
    this.is_discount = body.is_discount 
    this.discounted_price = body.discounted_price 
    this.image = body.image 
    this.slots = body.slots 

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     service_name : Joi.string().required(), 
    description : Joi.string().required(), 
    price : Joi.string().required(), 
    is_discount : Joi.number().required(), 
    discounted_price : Joi.string().required(), 
    image : Joi.string().required(), 
    slots : Joi.number().optional().allow(""), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = servicesModel;      
      