var express = require('express');
var moment = require('moment');
var router = express.Router();

var sess;

// shows homepage

router.get('/', function (req, res, next) {
  res.render('index');
});

// shows contact page

router.get('/contact', function (req, res, next) {
  res.render('contact');
});

//shows about page

router.get('/about', function (req, res, next) {
  res.render('about');
});

router.get('/admin', AdminHomePage);
router.get('/staff', StaffHomePage);


// shows admin home page

function AdminHomePage(req, res, next) {
  sess = req.session;
  console.log(Object.keys(sess))
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'admin') {
    return res.render('admin/index');
  }
  else{
    return res.send('un autherised user please go back');
  }
}

// shows staff/faculity home page

function StaffHomePage(req, res, next) {
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login') 
  }
  else if (sess.role == 'faculity') {
    return res.render('staff/staff');
  }
  else{
    return res.send('un autherised user please go back');
  }
}

module.exports = router;
