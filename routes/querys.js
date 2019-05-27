var express = require('express');
var router = express.Router();
var Query = require('../models/query.js');

router.get('/notes/:nid', function(req, res, next) {
  Query.getNote(req.params.nid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/getuser', function(req, res, next) {
  Query.getUser(req.body.uid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/getcomments', function(req, res, next) {
  var nid = req.body.nid;
  Query.getComments(nid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/addcomment', function(req, res, next) {
  var ctext = req.body.comment;
  var nid = req.body.nid;
  var uid = req.body.uid;
  Query.addComment(nid, uid, ctext, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/getfriendsout', function(req, res, next) {
  Query.getFriendsOut(req.body.uid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/getfriendsin', function(req, res, next) {
  Query.getFriendsIn(req.body.uid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/sendfriendrequest', function(req, res, next) {
  var uid =req.body.uid;
  var friendUsername = req.body.searchUsername;

  Query.getUserByName(friendUsername, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      if (rows.length) {
        if (rows[0].uid == uid){
          res.sendStatus(202)
        } else {
          var friendId = rows[0].uid;
          console.log(uid, friendId);
          Query.checkFriend(uid, friendId, function(err, rows) {
            console.log(rows);
            if (rows.length) {
              res.sendStatus(203)
            } else {
              console.log('here');
              Query.addFriend(uid, friendId, function(result) {
                res.json({result: result})
              })
            }
          })
        }
      } else {
        res.sendStatus(201)
      }
    }
  });
});

router.post('/confirmfriend', function(req, res, next) {
  var uid =req.body.confirmUid;
  var friendid = req.body.uid;
  Query.confirmfriend(uid, friendid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/notesbyfilter', function(req, res, next) {
  Query.getNoteByFilter(req.body.uid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      // console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/allnotes', function(req, res, next) {
  Query.getAllNotes(req.params.nid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      // console.log(rows);
      res.json(rows);
    }
  });
});

router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log(username);
  Query.checkExist(username, function(bool) {
    if (bool) {
      Query.login(username, password, function(err, rows) {
        if (err) {
          res.json(err)
        } else {
          if (rows.length) {
            console.log('login success');
            res.json({
              uid: rows[0].uid
            });
          } else {
            console.log('Invalid username or password');
            res.sendStatus(201);
          }
        }
      })
    } else {
      console.log('Username do not exist');
      res.sendStatus(202);
    }
  })
})

router.post('/signup', function(req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var state = req.body.state;
  var city = req.body.city;
  var lat = req.body.lat;
  var lng = req.body.lng;
  Query.checkExistUsernameEmail(username, email, function(bool) {
    if (bool) {
      console.log('Username or email exist!');
      res.sendStatus(201);
    } else {
      console.log('add new user');
      var finalLid = 0;
      Query.checkLocation(lat, lng, function(err, rows) {
        if (err) {
          res.json(err);
        } else {
          if (rows.length) {
            finalLid = rows[0].lid;
            Query.signUp(username, email, password, state, finalLid, city, function(uid) {
              if (err) {
                res.json(err)
              } else {
                res.json({
                  uid: uid
                })
              }
            })
          } else {
            Query.addLocation('temp test', lat, lng, '1', function(lid) {
              if (err) {
                res.json(err);
              }
              finalLid = lid;
              Query.signUp(username, email, password, state, finalLid, city, function(uid) {
                if (err) {
                  res.json(err)
                } else {
                  res.json({
                    uid: uid
                  })
                }
              })
            });
          }
        }
      });
    }
  })
});

router.post('/newpost', function(req, res) {
  var uid = req.body.uid;
  var ntext = req.body.ntext;
  var tagsString = req.body.tags;
  var privacy = req.body.privacy;
  var startTimeNumber = req.body.startTime;
  var endTimeNumber = req.body.endTime;
  var lid = req.body.lid;

  var startTime = new Date();
  startTime.setHours(startTimeNumber,0,0);
  startTimeString = startTime.toISOString().slice(0, 19).replace('T', ' ');
  var endTime = new Date();
  endTime.setHours(startTimeNumber,0,0);
  endTimeString = endTime.toISOString().slice(0, 19).replace('T', ' ');

  var flag = false;
  var tags = tagsString.split(/[ ]+/);
  Query.newSchedule("sname", startTimeString, endTimeString, function(result) {
    var sid = result;
    Query.getMaxTRId(function(err, result) {
      var trid = result[0].id + 1;
      for (i = 0; i < tags.length; i++) {
        Query.addTag(tags[i], function(result) {
          tid = result;
          Query.addTagRelation(tid, trid, function(result) {
            if (!flag) {
              Query.newNote(uid, trid, ntext, lid, sid, privacy, function(result) {
                res.json({
                  nid: result
                });
              })
              flag = true
            }
          })
        });
      }
    })
  })

});

router.post('/addlocation', function(req, res) {
  var lat = req.body.lat;
  var lng = req.body.lng;
  var lname = req.body.lname;
  Query.checkLocation(lat, lng, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      if (rows.length) {
        res.json({
          lid: rows[0].lid
        });
      } else {
        Query.addLocation(lname, lat, lng, '1', function(rows) {
          if (err) {
            res.json(err);
          }
          res.json({
            lid: rows[0].lid
          });
        });
      }
    }
  });
});

router.post('/updateuser', function(req, res, next) {
  var username = req.body.username;
  var state = req.body.state;
  Query.updateUser(username, state, function(result){
    res.json({username})
  })
});

router.post('/getfilter', function(req, res) {
  var uid = req.body.uid;
  Query.getFilter(uid, function(err, rows) {
    if (err) {
      res.json(err);
    } else {
      res.json(rows);
    }
  })
})

router.post('/updatefilter', function(req, res) {
  var startTimeNumber = req.body.filterStartTime;
  var endTimeNumber = req.body.filterEndTime;
  var uid = req.body.uid;
  var fradius = req.body.fradius;

  var startTime = new Date();
  startTime.setHours(startTimeNumber,0,0);
  startTimeString = startTime.toISOString().slice(0, 19).replace('T', ' ');
  var endTime = new Date();
  endTime.setHours(endTimeNumber,0,0);
  endTimeString = endTime.toISOString().slice(0, 19).replace('T', ' ');

  Query.updateFilter(uid, startTimeString, endTimeString, fradius, function(result){
    res.json(result)
  })
})

//
// router.post('/', function(req, res, next) {
//
//   Task.addTask(req.body, function(err, count) {
//
//     //console.log(req.body);
//     if (err) {
//       res.json(err);
//     } else {
//       res.json(req.body); //or return count for 1 & 0
//     }
//   });
// });
//
// router.post('/:id', function(req, res, next) {
//   Task.deleteAll(req.body, function(err, count) {
//     if (err) {
//       res.json(err);
//     } else {
//       res.json(count);
//     }
//   });
// });
//
// router.delete('/:id', function(req, res, next) {
//
//   Task.deleteTask(req.params.id, function(err, count) {
//
//     if (err) {
//       res.json(err);
//     } else {
//       res.json(count);
//     }
//
//   });
// });
//
// router.put('/:id', function(req, res, next) {
//   Task.updateTask(req.params.id, req.body, function(err, rows) {
//
//     if (err) {
//       res.json(err);
//     } else {
//       res.json(rows);
//     }
//   });
// });

module.exports = router;
