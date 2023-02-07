
/* Send Response*/
exports.resHandler = (success, data, message, res, status) => {
    if(res){
        return res.status(status).json({ success, data: data, message: message });

    }
};
