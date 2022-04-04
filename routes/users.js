/* 
* Description : User Management
* Author : Ananthu Krishnan
* Created On : 31-03-2022
*/

var express = require('express');
var router = express.Router();



router.get('/', UserList);
router.get('/add', AddUser);
router.post('/add', SaveUser);
router.get('/edit/:id', EditUser);
router.post('/edit/:id', UpdateUser);
router.get('/view/:id', GetUserById);
router.get('/delete/:id', DeleteUser);
router.post('/delete/:id', DeleteUserById);
router.get('/search', searchUserByUsername);
router.get('/login', LoginPage);
router.post('/login', Login);
router.get('/logout', Logout);


var sess;

//get user list

function UserList(req, res, next) {
  sess = req.session;
  req.getConnection(function (err, connection) {
    query = connection.query('select * from users', function (err, rows) {
      if (err) {
        console.log("something wrong", err);
      }
      else if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
      }
      else if (sess.role == 'admin') {
        // console.log(rows);
        return res.render('admin/user/users', { 'data': rows });
      }
      else {
        return res.render('acces_denied');
      }
    });
  });

}

//show user add page

function AddUser(req, res, next) {
  sess = req.session;

  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {

    return res.render('admin/user/add_user');
  }
  else {
    return res.render('acces_denied');
  }
}

//add a new user

function SaveUser(req, res, next) {
  var userData = JSON.parse(JSON.stringify(req.body));
  sess = req.session;

  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      connection.query('SELECT username from users where username=?', userData.username, function (err, rows) {
        // console.log(Object.keys(rows))
        if (Object.keys(rows).length > 0) {
          return res.render('admin/user/add_user', { message: 'username already taken' });
        }
        else if (userData.password != userData.password1) {
          return res.render('admin/user/add_user', { message: 'password not same' });
        }
        else {
          var input = {
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            passwords: userData.password,
            role: userData.role,
          }
          connection.query("insert into users set ?", input, function (err, rows) {
            if (err) {
              console.log("insertion error: " + err);
            }
            return res.redirect("/users");
          });
        }
      });
    });
  }
  else {
    return res.render('acces_denied');;
  }

}



//show edit user page

function EditUser(req, res, next) {
  var userId = req.params.id;

  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      var query = connection.query('select * from users where userId = ?', userId, function (err, rows) {
        if (err) {
          console.log(" error: while editing" + err);
        }
        else {
          res.render("admin/user/edit_user", { data: rows });
        }
      });
    });
  }
  else {
    return res.render('acces_denied');
  }



}

// update the user

function UpdateUser(req, res, next) {
  var userData = JSON.parse(JSON.stringify(req.body));
  var userId = req.params.id;

  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    var input = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      passwords: userData.password,
      role: userData.role,
    }
    req.getConnection(function (err, connection) {
      var query = connection.query("update users set ? where userId = ?", [input, userId], function (err, rows) {
        if (err) {
          console.log("updating error: " + err);
        }
        res.redirect("/users")
      });
    });
  }
  else {
    return res.render('acces_denied');;
  }

}

// get user by id

function GetUserById(req, res, next) {
  var userId = req.params.id;
  // console.log(id)
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      query = connection.query('select * from users where userId = ?', userId, function (err, rows) {
        if (err) {
          console.log("something wrong", err);
        }
        else {
          res.render('admin/user/view_user', { 'data': rows });
        }
      });
    });
  }
  else {
    return res.render('acces_denied');;
  }
}

//show delete user page

function DeleteUser(req, res, next) {
  var userId = req.params.id;

  req.getConnection(function (err, connection) {
    var query = connection.query('select username from users where userId = ?', userId, function (err, rows) {
      if (err) {
        console.log("Error deletion : %s ", err);
      }
      else if (Object.keys(sess).length == 1) {
        return res.redirect('/users/login');
      }
      else if (sess.role == 'admin') {
        res.render('admin/user/delete_user', { data: rows, input: userId });
      }
      else {
        return res.render('acces_denied');;
      }
    });
  });

}


//delete user by id

function DeleteUserById(req, res, next) {
  var userId = req.params.id;
  if (Object.keys(sess).length == 1) {
    return res.redirect('/users/login');
  }
  else if (sess.role == 'admin') {
    req.getConnection(function (err, connection) {
      connection.query('delete from users where userId = ?', userId, function (err, rows) {
        if (err) {
          console.log("deletion error" + err);
        }
        else {
          return res.redirect('/users');
        }
      });
    });
  }
  else {
    return res.render('acces_denied');;
  }


}

//search user by username
function searchUserByUsername(req, res, next) {
  var userName = req.query.username;
  if (Object.keys(sess).length == 1) {
    return res.redirect('users/login')
  }
  else if (sess.role == 'admin') {
    if (userName === '') {
      return res.redirect('/users')
    }
    else {
      req.getConnection(function (err, connection) {
        query = connection.query('select * from users where userName =?',userName, function (err, rows) {

          {
            console.log(rows);
            return res.render('admin/user/users', { 'data': rows });
          }
        });
      });
    }

  }
}

// get login page

function LoginPage(req, res, next) {
  sess = req.session;
  if (sess.isLogin) {
    res.send('you are already logged in this session')
  }
  else {
    res.render('login');
  }

}

// user authenticatication 

function Login(req, res, next) {
  var sess = req.session;
  var username = req.body.username;
  var password = req.body.password;
  sess.username = username;
  sess.password = password;

  req.getConnection(function (err, connection) {
    connection.query('select userId ,passwords from users where username= ?', username, function (err, rows) {
      if (Object.keys(rows).length == 0) {
        console.log("invalid credentials", err);
        return res.render('login', { message: 'invalid username or password' });
      }

      else if (password != rows[0].passwords) {
        return res.render('login', { message: 'password is incorrect' });

      }
      else {
        sess.UserId = rows[0].userId;
        connection.query('select role from users where username = ? and passwords = ?', [username, password], function (err, rows) {
          if (err) {
            console.log("invalid credentials", err);
          }
          else {
            sess.role = rows[0].role;
            sess.isLogin = true;
            console.log(sess);
            if (rows[0].role == 'admin') {
              return res.redirect('/admin')
            }
            else if (rows[0].role == 'faculity') {
              return res.redirect('/staff')
            }
            else {
              return res.redirect('/users/login')
            }
          }
        });
      }
    });
  });
}


//user log out

function Logout(req, res, next) {

  req.session.destroy();
  res.redirect('/users/login')

}

module.exports = router;


