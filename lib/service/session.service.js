let self = module.exports = {
    initializeRedis: (client, store) => {
        redisClient = client;
        redisStore = store;
    },
    setSession: (sessionId, userObj, ipAddress, userType) => {
        return new Promise((resolve, reject) => {
            redisClient.hmset(sessionId, {
                userId: userObj.id.toString(),
                name: userObj.name ? userObj.name : '',
                createdAt: new Date(),
                ipAddress: ipAddress ? ipAddress : ''
            }, (err, reply) => {
                if (err) {
                    reject(err);
                }
                if (userType === 1) {
                    redisClient.expire(sessionId, 60);
                }
                resolve(sessionId);
            })
        })
    },
    getSession: (sessionId, userType) => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall(sessionId, (err, sessionObj) => {
                if (err) {
                    reject(err);
                }
                if (userType === 1) {
                    redisClient.expire(sessionId, 60);
                }
                resolve(sessionObj);
            });
        });
    }

};