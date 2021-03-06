const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const validator = require("email-validator");
// const dnsSync = require('dns-sync');
const emailExistence = require('email-existence');
const emailExists = require('email-exists');
const dns = require('dns');
// const dnsResolve = require('@zeit/dns-cached-resolve').default;

const asyncEmailCheck = email => {
  return new Promise((resolve, reject) => {
    emailExistence.check(email, (err, resp) => {
      if (err) {
        reject(err);
      }
      console.log(`email ${email} status: `, resp);
      resolve(resp);
    });
  });
};

router.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }))

// Get email list from form
router.post('/', async function(request, response) {

    response.setHeader('Content-Type', 'text/html');

    // Form data
    const emailList = request.body.email.split("\r\n");

    var approvedEmailList = [];

    for (var i = 0; i < emailList.length; i++) {
      // Email maask validation
      if (validator.validate(emailList[i])) {

        let isEmailChecked;
        try {
          // Check email existence
          isEmailChecked = await asyncEmailCheck(emailList[i]);
        } catch (err) {
          // If catch an exception just go out from current iteration
          console.log(`email ${emailList[i]} error: `, err);
          continue;
        }

        if (isEmailChecked) {
          // DEV
          console.log(`Email ${emailList[i]} is ok, ${emailList.length - i} left.`);
          // Adding email to array (for dev purpose)
          approvedEmailList.push(emailList[i]);
          // Adding email string to resposnse
          response.write(`${emailList[i]}</br>`);
        }
    }
  };

    console.log(approvedEmailList.length);
    response.end();
});

  module.exports = router;
