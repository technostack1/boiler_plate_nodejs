const FCM = require('fcm-push');
const config = require('../../config/environment')


let sendPushNotification = (fcmUserTokens, appData, notificationTitle, notificationBody,recipient_type) => {
    return new Promise((resolve, reject) => {
        const serverKey = config.fcmConfiguration.serverKey;
        if(notificationTitle === ""){
            notificationTitle = undefined;
        }
        const fcm = new FCM(serverKey);
        const message = {
            to: fcmUserTokens,
            data: appData,
            notification: {
                title: notificationTitle,
                body: notificationBody,
                sound: "default"
            }
        };
    
                console.log("message",message);
        fcm.send(message)
            .then(function (response) {

                resolve(response);
                console.log("Successfully sent with response: ", response);
            })
            .catch(function (err) {
                console.log("Something has gone wrong!",err);
                console.error(err);

                reject(err)
            })
    });

}

exports.sendPushNotification = sendPushNotification;
