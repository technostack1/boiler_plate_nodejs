const Joi = require('joi');
class profileModel {
  constructor(body)
    {
      
     this.profile_name = body.profile_name 
    this.profile_email = body.profile_email 
    this.userId = body.userId,
    this.profile_picture = body.profile_picture

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     profile_name : Joi.string().required(), 
    profile_email : Joi.string().required(), 
    userId : Joi.number().required(), 
    profile_picture : Joi.string().optional().allow(""), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = profileModel;      
      