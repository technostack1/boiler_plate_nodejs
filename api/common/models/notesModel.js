const Joi = require('joi');
class notesModel {
  constructor(body)
    {
      
     this.notes_type = body.notes_type 
    this.title = body.title 
    this.description = body.description 
    this.status = 1 
    this.profileId = body.profileId
    this.image = body.image
    this.month  = body.month 



    }
       
  validateSchema () {
    const schema = Joi.object().keys({
          
     notes_type : Joi.string().required(), 
    title : Joi.string().required(), 
    description : Joi.string().required(), 
    status : Joi.number().optional().allow(""), 
    profileId : Joi.number().required(), 
    image : Joi.string().optional().allow(""), 
    month : Joi.string().optional().allow(""), 
       
    })
    return Joi.validate(this, schema)
    }
  }
  module.exports = notesModel;      
      