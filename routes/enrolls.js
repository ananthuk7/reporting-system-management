
var express = require('express');
var moment = require('moment');
var router = express.Router();

router.get('/', EnrollmentList);
router.get('/add/:id', AddUserToEnrollment);
router.post('/add', AddAnEnrollment);
router.get('/search', SearchEnrollment);



// shows enrollment list

function EnrollmentList(req, res, next) {
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'faculity') {
    var userId = sess.UserId;
    req.getConnection(function (err, connection) {
      connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ?", userId, function (err, rows) {
        if (err) {
        }
        else {
          // console.log(rows)
          return res.render('staff/enrolls/enroll', { data: rows });
        }
      });
    });
  }
  else {
    return res.send('unautherised user please go back')
  }

}

// add a new enrollment

function AddAnEnrollment(req, res, next) {
  var input = JSON.parse(JSON.stringify(req.body));

  sess = req.session;
  var StudentEnrollmentData = {
    userId: sess.UserId,
    studentId: input.studentId,
    startDate: input.startDate,
    endDate: input.endDate
  }
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'faculity') {
    req.getConnection(function (err, connection) {
      connection.query('insert into enquires set ?', StudentEnrollmentData, function (err, rows) {
        if (err) {
          console.log(err);
        }
        else {
          return res.redirect('/staff')
        }
      })
    })
  }
  else {
    return res.send('unautherised user please go back');
  }
}



// add user to the enrollment by user id

function AddUserToEnrollment(req, res, next) {
  var studentId = req.params.id;
  sess = req.session;
  var userId = sess.UserId;
  var data = {
    enquiry: true,
    userId: userId,
  };
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'faculity') {
    req.getConnection(function (err, connection) {
      connection.query('update students set ? where id =?', [data, studentId], function (err, rows) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(sess.UserId)
          res.render('staff/enrolls/add_enroll', { userId: sess.UserId, sId: studentId });
        }
      });
    })
  }
  else {
    return res.send('unautherised user please go back');
  }
}

// search the enrollment based on course start date and end date

function SearchEnrollment(req, res, next) {
  sess = req.session;
  var input = req.query;
  var userId = sess.UserId;
  var courseName = input.course;
  var startDate = input.startDate;
  var endDate = input.endDate;

  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'faculity') {
    req.getConnection(function (err, connection) {

      if (courseName === '' && startDate === '' && endDate === '') { //both of them are empty
        return res.redirect('/enrolls')
      }
      else if (courseName != '' && startDate != '' && endDate != '') { // course name ,startdate ,endate is present
        connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ? and s.course =? and e.startDate >= ? and e.startDate <= ? ", [userId, courseName, startDate, endDate], function (err, rows) {

          return res.render('staff/enrolls/enroll', { data: rows });

        });
      }
      else if (courseName != '' && startDate === '' && endDate === '') { // both startdate and end date is absent and coursename is present
        connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ? and s.course =?", [userId, courseName], function (err, rows) {

          return res.render('staff/enrolls/enroll', { data: rows });

        });
      }
      else if (courseName === '' && startDate != '' && endDate != '') {// courseName is absent and both startDate and endDate is present
        connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ?  and e.startDate >= ? and e.startDate <= ? ", [userId, startDate, endDate], function (err, rows) {

          return res.render('staff/enrolls/enroll', { data: rows });

        });
      }
      else if ((courseName === '' && startDate != '') || (courseName == '' && endDate != '')) { //course name is absent and enddate or startdate is present
        var date = startDate ? startDate : endDate;
        connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ? and e.startDate = ?", [userId, date], function (err, rows) {

          return res.render('staff/enrolls/enroll', { data: rows });

        });
      }
      else if ((courseName != '' && startDate != '') || (courseName != '' && endDate != '')) {//course name is present and startdate or end date is present and
        var date = startDate ? startDate : endDate;
        connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ? and s.course =? and e.startDate = ?", [userId, courseName, date], function (err, rows) {

          return res.render('staff/enrolls/enroll', { data: rows });

        });
      }
    });
  }
  else {
    return res.send('unautherised user please go back')
  }



}


module.exports = router
