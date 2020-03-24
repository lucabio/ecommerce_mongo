var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'lucabio84@gmail.com',
//         pass: 'mrcoff33'
//     }
// });

// const mailOptions = {
//     from: 'lucabio84@gmail.com', // sender address
//     to: data.email, // list of receivers
//     subject: 'Subject of your email', // Subject line
//     html: '<p>Your html here</p>'// plain text body
// };

// transporter.sendMail(mailOptions, function (err, info) {
//     if (err)
//         console.log(err)
//     else
//         console.log(info);
// });

module.exports = class Email {
    constructor(to,subject,html) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'lucabio84@gmail.com',
                pass: 'mrcoff33'
            }
        });

        this.mailOptions = {
            from: 'lucabio84@gmail.com', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html// plain text body
        };
    }

    send(cb){
        this.transporter.sendMail(this.mailOptions,cb());
    }
}