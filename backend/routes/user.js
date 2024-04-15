const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email, password, role, status from user where email = ?"
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                query = "insert into user (name, contactNumber, email, password, status, role) values (?, ?, ?, ?,'false', 'user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "User created" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({ message: "User already exists" });

            }

        }
        else {
            return res.status(400).json(err);
        }
    });
});

router.post('/login', (req, res) => {

    const user = req.body;
    query = "select email, password, role, status from user where email = ? and password = ?";
    connection.query(query, [user.email, user.password], (err, result) => {
        if (!err) {
            if (result.length <= 0 || result[0].password != user.password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            else if (result[0].status == 'false') {
                return res.status(401).json({ message: "User not verified, wait for Admin Approval" });

            }
            else if (result[0].password == user.password) {
                const response = { email: result[0].email, role: result[0].role }
                const accesToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accesToken });

            }
            else {
                return res.status(400).json({ message: "Something went wrong, please try again later" });
            }
        }
        else {
            return res.status(400).json(err);
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email, password from user where email = ?";
    connection.query(query, [user.email], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (result.length <= 0) {
            return res.status(200).json({ message: "Password sent successfully to your email" });
        }
        var mailOptions = {
            from: process.env.EMAIL,
            to: result[0].email,
            subject: 'Password Recovery from SmashBurger',
            html: '<h1>Your password is: ' + result[0].password + '</h1>'
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error); // Aggiungi questa linea
                return res.status(400).json(error);
            } else {
                return res.status(200).json({ message: "Password sent successfully to your email" });
            }
        });
    })
})

router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id,name,email,contactNumber,status from user where role = 'user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status = ? where id = ?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(200).json({ message: "User id doesnt exist" });

            }
            return res.status(200).json({ message: "User status updated" });
        }
        else {
            return res.status(500).json(err);
        }
    });
}
);

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "True" });
}
);

router.post('/changePassword',auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email = ? and password = ?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect Old password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update user set password = ? where email = ?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password updated" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({ message: "Something went wrong, please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    }
    );
}
);


module.exports = router;