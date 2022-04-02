
var express = require('express');
var router = express.Router();

router.get('/', EnrollmentList);
router.get('/add/:id', AddUserToEnrollment);
router.post('/add', AddAnEnrollment);



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
          console.log(rows)
          res.render('staff/enrolls/enroll', { data: rows });
        }
      });
    });
  }
  else {
    res.send('unautherised user please go back')
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
  else if (sess.role == 'faculity'){
  req.getConnection(function (err, connection) {
    var query = connection.query('update students set ? where id =?', [data, studentId], function (err, rows) {
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
else{
  return res.send('unautherised user please go back');
}
}


module.exports = router
