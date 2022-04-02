
var express = require('express');
var router = express.Router();

router.get('/', EnrollmentList);
router.post('/add', AddAnEnrollment);
router.get('/add/:id', AddUserToEnrollment);
router.get('/student/enroll/add/:id', EnrollForm);
router.post('/student/enroll/add/',SaveEnrollment);

// shows enrollment list

function EnrollmentList(req, res, next) {
    sess = req.session;
    var userId = sess.UserId;
    req.getConnection(function (err, connection) {
        var query = connection.query("select s.name,s.email,s.contactNo,s.course,s.Cstatus,e.startDate,e.EndDate from enquires e join students  s where s.id = e.studentId and e.userId = ?", userId, function (err, rows) {
            if (err) {                                                                         
            }
            else {
                console.log(rows)
                res.render('staff/enrolls/enroll', { data: rows });
            }
        });
    });
}

// add a new enrollment

function AddAnEnrollment(req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input);
    sess = req.session;
    var data = {
        userId: sess.UserId,
        studentId: input.studentId,
        startDate: input.startDate,
        endDate: input.endDate
    }
    req.getConnection(function (err, connection) {
        var query = connection.query('insert into enquires set ?', data, function (err, rows) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/staff')
            }
        })
    })
}



// add user to the enrollment by user id

function AddUserToEnrollment(req, res, next) {
    var id = req.params.id;
    sess = req.session;
    var userId = sess.UserId;
    console.log(sess)
    console.log(userId)
    var data = {
        enquiry: true,
        userId: userId,
    };
    req.getConnection(function (err, connection) {
        var query = connection.query('update students set ? where id =?', [data, id], function (err, rows) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(sess.UserId)
                res.render('staff/enrolls/add_enroll', { userId: sess.UserId, sId: id });
            }

        });


    })
}



function EnrollForm(req, res, next) {
    var id = req.params.id;
    req.getConnection(function (err, connection) {
      var query = connection.query('select * from courses where courseId = ?',id ,function (err, rows) {
        if (err) {
          console.log('err')
        }
        else {
          
          res.render('enroll_form', { data: rows });
          
        }
      })
    })
  }
  
function SaveEnrollment(req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input);
    var data = {
      name: input.firstname,
      email: input.email,
      contactNo: input.contact,
      course: input.course,
      address: input.address,
      dob: moment(input.dob).format('YYYY-MM-DD'),
      gender: input.gender,
      qualification: input.qualification,
      state: input.state,
      guardianName: input.guardian,
      enquiry: false
    };
    console.log(data);
    req.getConnection(function (err, connection) {
      var query = connection.query('insert into students set ?', data, function (err, rows) {
        if (err) {
          console.log('Error', err)
        }
        else {
          res.redirect('/')
        }
      })
    })
  }

  module.exports = router
  