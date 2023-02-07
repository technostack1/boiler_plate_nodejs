const Joi = require('joi');
class remainderModel {
  constructor(body)
    {
      
     this.remainder_name = body.remainder_name 
    this.remainder_time = body.remainder_time 
    this.profileId = body.profileId 
    this.remainder_notes_send = 0 

    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     remainder_name : Joi.string().required(), 
    remainder_time : Joi.string().required(), 
    profileId : Joi.string().required(), 
    remainder_notes_send : Joi.number().required(), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = remainderModel;      
      