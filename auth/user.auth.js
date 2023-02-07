const express = require('express');
const session = require('express-session');

const compose = require('composable-middleware');
const app = express();
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

const db = require('../config/dbConnection');

app.use(session({ secret: config.secrets.key, cookie: { } }));


exports.authenticatingAdminSession = authenticatingAdminSession = () => {
    return compose()
        .use((req, res, next) => {
            let error = {
                "errorCode" : 1008,
                "errorMessgae" : "Access denied. No token provided."
              };
                console.log("here me");
            const token = req.headers["x-access-token"] || req.headers["authorization"];
            //if no token found, return response (without going to the next middelware)
            if (!token) return res.status(401).json(error);
        
            try {
                //if can verify the token, set req.user and pass to next middleware
                const decoded = jwt.verify(token, config.secrets.key);
                req.user = decoded;

                // Verify user exists in database
                   let query = `Select * from users where id = ${decoded.id} `;
                   db.sequelize.query(query).then(([results, metadata]) => {
                    next();
        
               })
               .catch(error =>{
                res.status(401).json(error);
             
               });
             
        
            } catch (ex) {
                //if invalid token
                error = {
                    "errorCode" : 1009,
                    "errorMessgae" : "Access denied. Invalid token."
                  };
        
                res.status(401).json(error);
            }
                    
            
        })

};