var express = require('express');
var moment = require('moment');
var router = express.Router();


router.get('/', AllStudents);
router.get('/add/:id', AddStudent);
router.post('/enrolls', SaveStudent);
router.get('/delete/:id', DeleteStudentByID);
router.post('/delete/:id', DeleteStudent);
router.get('/view/:id', GetStudentByID);
router.get('/status/:id', Status);
router.post('/status/:id', StatusUpdate);

var sess;

//shows list of all students

function AllStudents(req, res, next) {
    sess = req.session;
    req.getConnection(function (err, connection) {
        var query = connection.query("select * from students ", function (err, rows) {
            if (err) {
                console.log("error", err)
            }
            else if (Object.keys(sess).length == 1) {
                return res.redirect('/users/login');
            }
            else if (sess.role == 'faculity') {
                return res.render('staff/students/students', { data: rows });
            }
            else {
                return res.send('unautherised user please go back')
            }
        });
    });
};

//shows page for add a new student

function AddStudent(req, res, next) {
    sess = req.session;
    var courseId = req.params.id;
    req.getConnection(function (err, connection) {

        //if requestd url for student then this  will work and also passes the course id for selecting the course

        if (Object.keys(sess).length == 1) {
            connection.query('select * from courses where courseId = ?', courseId, function (err, rows) {
                if (err) {
                    console.log('err')
                }
                else {
                    return res.render('enroll_form', { data: rows });
                }
            });

        }
        //if requestd url for admin then this  will work and also passes all the courses avilable

        else if (sess.role == 'faculity') {
            connection.query('select * from courses ', function (err, rows) {
                if (err) {
                    console.log('err')
                }
                else {
                    return res.render('staff/students/add_student', { data: rows });
                }
            });

        }
        else {
            return res.send('unautherised user please go back')
        }
    })
}

// add a new student

function SaveStudent(req, res, next) {
    var studentData = JSON.parse(JSON.stringify(req.body));
    sess = req.session;
    var data = {
        name: studentData.firstname,
        email: studentData.email,
        contactNo: studentData.contact,
        course: studentData.course,
        address: studentData.address,
        dob: moment(studentData.dob).format('YYYY-MM-DD'),
        gender: studentData.gender,
        qualification: studentData.qualification,
        state: studentData.state,
        guardianName: studentData.guardian,
        enquiry: false,
        Cstatus: 'active'
    };
    console.log(data);

    if (Object.keys(sess).length == 1) {
        req.getConnection(function (err, connection) {
            connection.query('insert into students set ?', data, function (err, rows) {
                if (err) {
                    console.log('Error', err)
                }
                else {
                    return res.redirect('/')
                }
            });
        });
    }
    else if (sess.role == 'faculity') {
        req.getConnection(function (err, connection) {
            connection.query('insert into students set ?', data, function (err, rows) {
                if (err) {
                    console.log('Error', err)
                }
                else {
                    return res.redirect('/students')
                }
            });
        });
    }
    else {
        return res.send('unautherised user please go back')
    }

};

//shows student delete page

function DeleteStudent(req, res, next) {
    var studentId = req.params.id;
    sess = req.session;

    if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
    }
    else if (sess.role == 'faculity') {
        req.getConnection(function (err, connection) {
            connection.query('select name from students where id = ?', studentId, function (err, rows) {
                if (err) {
                    console.log("Error deletion : %s ", err);
                }
                else {
                    return res.render('staff/students/delete_student', { data: rows, id: studentId });
                }
            });
        });
    }
    else {
        return res.send('unautherised user please go back')
    }



}
//delete student by id

function DeleteStudentByID(req, res, next) {

    var StudentId = req.params.id;
    sess = req.session;

    if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
    }
    else if (sess.role == 'faculity') {
        req.getConnection(function (err, connection) {
            connection.query("DELETE FROM students  WHERE id = ? ", StudentId, function (err, rows) {
                if (err)
                    console.log("Error on deleting course : %s ", err);
                return res.redirect('/students');
            });
        });
    }
    else {
        return res.send('unautherised user please go back')
    }

}

// get student by id

function GetStudentByID(req, res, next) {
    var studentId = req.params.id;
    sess = req.session;
    req.getConnection(function (err, connection) {
        var query = connection.query('select * from students where id = ?', studentId, function (err, rows) {
            if (err) {
                console.log("Error inserting : %s ", err);
            }
            else if (Object.keys(sess).length == 1) {
                return res.redirect('/users/login');
            }
            else if (sess.role == 'faculity') {
                res.render('staff/students/view_student', { data: rows });
            }
            else {
                return res.send('unautherised user please go back')
            }
        });
    });

}

// ow the status and end date update page 

function Status(req, res, next) {
    var studentId = req.params.id;
    sess = req.session;
    if (Object.keys(sess).length == 1) {
        return res.render('/users/login');
    } else if (sess.role == 'faculity') {
        res.render('staff/students/edit_status', { id: studentId })
    }
    else {
        return res.send('unautherised user please go back');
    }
}

// change the status of the student and end date of the enrollment by student id

function StatusUpdate(req, res, next) {

    var StudentId = req.params.id;
    sess = req.session;
    var data = JSON.parse(JSON.stringify(req.body));

    if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
    }
    else if (sess.role == 'faculity') {
        var studentStatus = {
            Cstatus: data.status
        }
        var courseEndDate = {
            EndDate: data.endDate
        }
        req.getConnection(function (err, connection) {
            connection.query('update  students set ? where id = ?', [studentStatus, StudentId], function (err, rows) {
                if (err) {
                    console.log(err);
                }
            });
            connection.query('update  enquires set ? where studentId = ?', [courseEndDate, StudentId], function (err, rows) {
                if (err) {
                    console.log(err);
                }
            })
            return res.redirect('/students');
        });
    }
    else {
        return res.send('unautherised user please go back');
    }
}

module.exports = router;