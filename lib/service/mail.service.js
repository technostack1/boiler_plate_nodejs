// const mailer = require('express-mailer');
const path = require("path");
const config = require('../../config/environment/index');
const express = require('express');
const app = express();
const ejs = require('ejs')
app.set('view engine', 'ejs');

const emailConfig = {
  apiKey: 'bb77bc9e890093c645c2a3711041695a-e5da0167-38638eb1',
  domain: 'mg.ruderequipment.com'
};
const mailgun = require('mailgun-js')(emailConfig);
const from = 'SBS <support@sbs.com>'

// mailer.extend(app, {
//   from: '"Lavender" <phpsols.developer@gmail.com>',
//   host: 'smtp.gmail.com', // hostname
//   secureConnection: false, // use SSL
//   port: 587, // port for secure SMTP
//   // transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
//   auth: {
//     user: 'phpsols.developer',
//     pass: 'testtest#@!',
//   },
// });

/*****************************************************************/
/* ============== ACCOUNTS MODULE EMAIL TEMPLATES ============== */
/*****************************************************************/

// EMAIL VERIFICATION
exports.emailVerification = emailVerification = (email, name, link) => {

  mailgun.messages().send('emailTemplates/accounts/signup', {
    from: from,
    to: email,
    subject: 'Activate your Lavender account',
    nameProperty: name,
    linkProperty: link,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// ACCOUNT WELCOME
exports.userWelcome = userWelcome = (email, name, obj) => {
  ejs.renderFile('views/emailTemplates/accounts/welcome.ejs', {
    nameProperty: name,
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: 'Welcome to Lavender'
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}


// LISTING POSTED
exports.listingPosted = listingPosted = (email, name, link) => {
  console.log(email, name, link)
  ejs.renderFile('views/emailTemplates/accounts/listing.ejs', {
    nameProperty: name,
    link: link,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: 'Your Listing Has Been Posted!'
    }
    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
    });
  });
}

// PAYMENT CHARGED
exports.paymentCharged = paymentCharged = (email, name, obj) => {
  ejs.renderFile('views/emailTemplates/accounts/payment-charged.ejs', {
    nameProperty: name,
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: 'Receipt from Your Payment to Lavender!'
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// PAYMENT DECLINED
exports.paymentDeclined = paymentDeclined = (email, name, obj) => {
  ejs.renderFile('views/emailTemplates/accounts/payment-declined.ejs', {
    nameProperty: name,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: 'Your Payment Was Declined!'
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// Inquiry
exports.inquiry = inquiry = (email, name, obj, listingName) => {
  ejs.renderFile('views/emailTemplates/accounts/inquiry.ejs', {
    nameProperty: name,
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: `Inquiry on Your Listing ${listingName}`
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}


// Contact us
exports.contactus = contactus = (email, name, obj) => {
  ejs.renderFile('views/emailTemplates/accounts/contactus.ejs', {
    nameProperty: name,
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject:'New “Contact Us” Submission from User'
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}
// Contact us person
exports.contactPerson = contactPerson = (email, name, obj) => {
  ejs.renderFile('views/emailTemplates/accounts/contact-submission.ejs', {
    nameProperty: name,
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject:'Thank you for getting in touch with us!'
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// report 
exports.report = report = (email, obj, listingName) => {
  ejs.renderFile('views/emailTemplates/accounts/report.ejs', {
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject:`User has Reported a Problem with a Listing ${listingName}`
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// report  person
exports.reportPerson = reportPerson = (email, obj, listingName) => {
  console.log(email)
  ejs.renderFile('views/emailTemplates/accounts/report-person.ejs', {
    details: obj,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject:`Your message has been received on listing ${listingName}`
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// Inquiry reply
exports.inquiryReply = inquiryReply = (email, name, message, listingName) => {
  ejs.renderFile('views/emailTemplates/accounts/inquiry-reply.ejs', {
    nameProperty: name,
    message: message,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: `Reply to  Your Inquiry on ${listingName}`
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// listing disabled
exports.listingDisabled = listingDisabled = (email) => {
  ejs.renderFile('views/emailTemplates/accounts/listing-disabled.ejs', {
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: `Cron successfully executed`
    }

    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
      console.log(info)
    });
  });
}

// IDENTITY VERIFICATION
exports.profileVerified = profileVerified = (email, name) => {

  app.mailer.send('emailTemplates/accounts/profile-verified', {
    to: email,
    subject: 'Identitiy verified by Lavender',
    nameProperty: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// ACCOUNT PASSWORD CHANGED
exports.userChangedPassword = userChangedPassword = (email, name) => {

  app.mailer.send('emailTemplates/accounts/password-changed', {
    to: email,
    subject: 'Your Lavender password has changed',
    nameProperty: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// ACCOUNT EMAIL CHANGED
exports.userEmailChanged = userEmailChanged = (email, name) => {

  app.mailer.send('emailTemplates/accounts/email-changed', {
    to: email,
    subject: 'Your Lavender email has changed',
    nameProperty: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// HOST ACCESS RESTRICTION
exports.accountRestriction = accountRestriction = (email, name) => {

  app.mailer.send('emailTemplates/accounts/account-restriction', {
    to: email,
    subject: 'Your account has been restricted',
    nameProperty: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// ACCOUNT DISABLED
exports.changeUserStatus = changeUserStatus = (email, name) => {

  app.mailer.send('emailTemplates/accounts/account-disabled', {
    to: email,
    subject: 'Your account has been disabled',
    nameProperty: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

/*****************************************************************/
/* ============== VEHICLE MODULE EMAIL TEMPLATES =============== */
/*****************************************************************/

// PENDING VEHICLE
exports.PendingVehicleEmail = VehiclePending = (subject, name, email) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-pending', {
    to: email,
    subject: 'Your ' + subject + ' is under review',
    name: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// VEHICLE APPROVAL 
exports.ApprovedVehicleEmail = ApprovedVehicleEmail = (subject, name, email, heading, url) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-approved', {
    to: email,
    subject: subject,
    name: name,
    heading: heading,
    baseUrl: config.baseUrl,
    url: url
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// HOLD VEHICLE
exports.HoldVehicleEmail = HoldVehicleEmail = (subject, name, email) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-hold', {
    to: email,
    subject: subject,
    name: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// DEACTIVATE VEHICLE
exports.DeactivatedVehicleEmail = DeactivatedVehicleEmail = (subject, name, email) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-deactivate', {
    to: email,
    subject: subject,
    name: name,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// REACTIVATE VEHICLE
exports.ReactivateVehicleEmail = ReactivateVehicleEmail = (subject, name, email, heading, url) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-reactivate', {
    to: email,
    subject: subject,
    name: name,
    heading: heading,
    url: url,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}

// DISABLE VEHICLE
exports.DisabledVehicleEmail = DisabledVehicleEmail = (subject, name, email, heading) => {

  app.mailer.send('emailTemplates/vehicles/vehicle-disabled', {
    to: email,
    subject: subject,
    name: name,
    heading: heading,
    baseUrl: config.baseUrl
  }, (mailErr) => {
    console.log('mailErr', mailErr);
    // return helper.resHandler(false, null, mailErr, res, 500);
    console.log(' noo mailErr');
    // return helper.resHandler(true, saveUser, null, res, 200);
  });
}




// RESET PASSWORD
exports.forgotPassword = forgotPassword = (email, name, link) => {
  //views/emailTemplates/accounts/forgot_password.ejs
  ejs.renderFile('views/emailTemplates/forgot_password.ejs', {
    nameProperty: name,
    link: link,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    console.log("err",err);
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: email,
      subject: 'Reset your password'
    }
    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
    });
  });
}



// orderRequestToProviders
exports.orderRequestToProviders = orderRequestToProviders = (customer_name, vendor_name,vendor_email, order_id,hash) => {
  console.log(customer_name);
  
  ejs.renderFile('views/emailTemplates/orderRequestToProviders.ejs', {
    customer_name: customer_name,
    vendor_name: vendor_name,
    order_id:order_id,
    link: 'http://72.167.52.82/order/accept+/'+hash,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    console.log("err",err);
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: vendor_email,
      subject: 'Order Request'
    }
    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
    });
  });
}




// orderAcceptedToCustomer
exports.orderAcceptedToCustomer = orderAcceptedToCustomer = (customer_name, vendor_name,vendor_email, order_id) => {
  ejs.renderFile('views/emailTemplates/orderAcceptedBy.ejs', {
    customer_name: customer_name,
    vendor_name: vendor_name,
    order_id:order_id,
    link: config.baseUrl+'/provider/accept/order/'+order_id,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    console.log("err",err);
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: vendor_email,
      subject: 'Order Request'
    }
    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
    });
  });
}



// orderAcceptedToProviders
exports.orderAcceptedToProviders = orderRequestToProviders = (customer_name, vendor_name,vendor_email, order_id) => {
  ejs.renderFile('views/emailTemplates/orderAcceptedBy.ejs', {
    customer_name: customer_name,
    vendor_name: vendor_name,
    order_id:order_id,
    link: config.baseUrl+'/provider/accept/order/'+order_id,
    baseUrl: config.baseUrl
  }, function (err, htmlString) {
    console.log("err",err);
    if (err) console.log(err);
    // not sure how mailgun works, but it's probably like this
    let mailOptions = {
      html: htmlString,
      from: from,
      to: vendor_email,
      subject: 'Order Request'
    }
    mailgun.messages().send(mailOptions, (err, info) => {
      if (err) console.log(err);
    });
  });
}



/*****************************************************************/
/* ================ EMAIL TEMPLATES ERROR LOG ================== */
/*****************************************************************/

exports.logError = logError = (userId, moduleName, errorMsg) => {
  const dbColumns = `user_id, module,error_msg`;
  const queryParams = [userId, moduleName, errorMsg];
  const queryValues = '?, ?,?';
  db.insert('error_log', dbColumns, queryValues, queryParams)
    .then(resp => {
      //   return true;
    })
    .catch(error => {
      //return false;
    });
}