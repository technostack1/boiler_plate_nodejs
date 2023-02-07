const express = require('express');

const controller = require('../controller');

const router = express.Router();

const auth = require('../../../auth/user.auth');



router.post('/customer/registration', controller.registration);
router.post('/customer/login', controller.login);
router.post('/customer/social-login', controller.socialLogin);

router.post('/customer/token',auth.authenticatingAdminSession(), controller.customerTokenSave);



////customer forget password
router.post('/customer/forget-password', controller.customerForgetPassword);
router.get('/customer/forget-password/:token', controller.customerVerifyResetPasswordToken);
router.post('/customer/create-password/', controller.customerResetPassword);

router.get('/customer/notes/search', controller.searchNotes);


router.get('/customer/remainder/cron', controller.cron);

router.post('/attachment', controller.attachment);


router.post('/:table',auth.authenticatingAdminSession(), controller.create);
router.post('/customer/payment',auth.authenticatingAdminSession(), controller.payment);

router.put('/:table/:id',auth.authenticatingAdminSession(), controller.edit);


router.post('/form/:table',auth.authenticatingAdminSession(), controller.createCommon);
router.put('/form/:table/:id',auth.authenticatingAdminSession(), controller.editCommon);

router.delete('/:table/:id',auth.authenticatingAdminSession(), controller.delete);


router.get('/:table',auth.authenticatingAdminSession(), controller.getAll);
router.get('/:table/:id',auth.authenticatingAdminSession(), controller.getSingle);

router.post('/customer/validate', controller.adminValidate);



module.exports = router;
