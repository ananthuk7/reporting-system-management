/* 
* Description : Course Management
* Author : Ananthu Krishnan
* Created On : 31-03-2022
*/

var express = require('express');
var router = express.Router();



router.get('/', ListCourses);
router.get('/add', AddCourse);
router.post('/', SaveCourse);
router.get('/update/:id', EditCourse);
router.post('/update/:id', UpdateCourse);
router.get('/view/:id', GetCourseById);
router.get('/delete/:id', DeleteCourse);
router.post('/delete/:id', DeleteCourseById);


var sess;

//get course list

function ListCourses(req, res, next) {
  sess = req.session;

  req.getConnection(function (err, connection) {
    connection.query('SELECT * FROM courses ', function (err, rows) {
      if (err) {
        console.log('Error Selecting : %s', err.message);

      }
      else {

        if (Object.keys(sess).length == 1) {
          return res.render('courses', { data: rows });
        }
        else if (sess.role == 'admin') {
          return res.render('admin/course/courses', { data: rows });
        }
        else {
          return res.render('acces_denied');
        }
      }
    });
  });

}

// show  course add page

function AddCourse(req, res, next) {
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    return res.render('admin/course/add_course');
  }
  else {
    return res.render('acces_denied');
  }
}

// insert a new course 
function SaveCourse(req, res, next) {
  var input = JSON.parse(JSON.stringify(req.body));
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      var data = {
        courseName: input.courseName,
        duration: input.duration,
        fees: input.fees,
        descriptions: input.description,
      }
      var query = connection.query("INSERT INTO courses set ? ", data, function (err, rows) {
        if (err)
          console.log("Error inserting : %s ", err);
        res.redirect('/courses');
      });
    });
  }
  else {
    return res.render('acces_denied');
  }
}

// get course by id

function GetCourseById(req, res, next) {
  var input = req.params.id;
  sess = req.session;
  req.getConnection(function (err, connection) {
    connection.query('select * from courses where courseId = ?', input, function (err, rows) {
      if (err) {
        console.log("Error inserting : %s ", err);
      }
      else if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
      }
      else if (sess.role == 'admin') {
        return res.render('admin/course/view_course', { data: rows });
      }
      else {
        return res.render('acces_denied');
      }
    });
  });

}

// show course edit page

function EditCourse(req, res, next) {
  var input = req.params.id;
  sess = req.session;
  req.getConnection(function (err, connection) {
    connection.query('select * from courses where courseId = ?', input, function (err, rows) {
      if (err) {
        console.log("Error inserting : %s ", err);
      }
      else if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
      }
      else if (sess.role == 'admin') {
        res.render('admin/course/edit_course', { data: rows });
      }
      else {
        return res.render('acces_denied');
      }
    });
  });
}

//upadte the course

function UpdateCourse(req, res, next) {
  var input = JSON.parse(JSON.stringify(req.body));
  var id = req.params.id;
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      var data = {
        courseName: input.courseName,
        duration: input.duration,
        fees: input.fees,
        descriptions: input.description,
      }
      var query = connection.query("UPDATE courses  set ? where courseId = ? ", [data, id], function (err, rows) {
        if (err)
          console.log("Error inserting : %s ", err);
        res.redirect('/courses');
      });
    });
  }
  else {
    return res.render('acces_denied');
  }
}

// show confirmation page for delete a course

function DeleteCourse(req, res, next) {
  sess = req.session;
  var input = req.params.id;
  req.getConnection(function (err, connection) {
    connection.query('select courseName from courses where courseId = ?', input, function (err, rows) {
      if (err) {
        console.log("Error deletion : %s ", err);
      }
      else if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
      }
      else if (sess.role == 'admin') {
        res.render('admin/course/delete_course', { data: rows, id: input });
      }
      else {
        return res.render('acces_denied');
      }
    });
  });

}

//delete a course

function DeleteCourseById(req, res, next) {
  var id = req.params.id;
  sess = req.session;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login')
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      var query = connection.query("DELETE FROM courses  WHERE courseId = ? ", id, function (err, rows) {
        if (err)
          console.log("Error on deleting course : %s ", err);
        return res.redirect('/courses');
      });
    });
  }
  else {
    return res.render('acces_denied');;
  }

}

module.exports = router;