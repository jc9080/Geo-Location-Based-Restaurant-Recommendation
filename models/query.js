var db = require('../dbconnection');
const request = require('request');

var Query = {
  getUser: function(uid, callback) {
    return db.query("SELECT * FROM user WHERE uid = ?", [uid], callback);
  },

  getUserByName: function(username, callback) {
    return db.query("SELECT * FROM user WHERE username = ?", [username], callback);
  },

  checkFriend: function(uid, friendId, callback) {
    return db.query("SELECT * FROM friend WHERE (uid=? and friendid=?) OR (uid=? and friendid =?)", [uid, friendId, friendId, uid], callback);
  },

  getFriendsOut: function(uid, callback) {
    return db.query("SELECT a.confirmed, b.username, b.uid FROM (SELECT * FROM user Natural JOIN friend WHERE uid =?) AS a JOIN user AS b on a.friendid = b.uid  ", [uid], callback);
  },

  getFriendsIn: function(uid, callback) {
    return db.query("SELECT a.confirmed, a.username, a.uid FROM (SELECT * FROM user Natural JOIN friend WHERE friendid =?) AS a JOIN user AS b on a.uid = b.uid", [uid], callback);
  },

  getNote: function(nid, callback) {
    return db.query("SELECT * FROM ((note NATURAL JOIN location) JOIN user ON note.uid=user.uid) NATURAL JOIN schedule WHERE nid =?;", [nid], callback);
  },

  getComments: function(nid, callback) {
    return db.query("SELECT * FROM comment NATURAL JOIN user WHERE nid = ?", [nid], callback);
  },

  getNoteByFilter: function(uid, callback) {
    var query = "SELECT a.uid AS uid, b.nid AS nid, b.latitude AS latitude, b.longitude AS longitude, b.ntime AS ntime, b.ntext AS ntext, b.lname AS lname, a.fradius AS fradius, a.fstarttime AS fstarttime, a.fendtime as fendtime, 69.0 *DEGREES(ACOS(LEAST(COS(RADIANS(a.latitude))* COS(RADIANS(b.latitude))* COS(RADIANS(a.longitude - b.longitude))+ SIN(RADIANS(a.latitude))* SIN(RADIANS(b.latitude)), 1.0))) AS distance_in_mile FROM ((SELECT L.uid, L.lid, L.fstarttime, L.fendtime,L.fradius,R.lname,R.latitude, R.longitude FROM (SELECT U.uid, U.lid, F.fstarttime, F.fendtime, F.fradius FROM user AS U JOIN filter AS F WHERE U.uid = F.uid) AS L JOIN location AS R WHERE L.lid = R.lid) AS a join (SELECT nid, ntext, ntime, lname, latitude, longitude FROM note JOIN location WHERE note.lid = location.lid) AS b) WHERE uid = ? HAVING distance_in_mile < fradius AND fstarttime < ntime AND fendtime > ntime;"
    return db.query(query, [uid], callback); // TODO need to change query
  },

  getAllNotes: function(nid, callback) {
    return db.query("SELECT * FROM note", [nid], callback);
  },

  getMaxTRId: function(callback) {
    return db.query("SELECT MAX(trid) as id FROM tagrelation", callback);
  },

  checkExistUsernameEmail: function(username, email, callback) {
    console.log('checking username, email if exist');
    db.query("SELECT uid FROM user WHERE username = ?", [username], function(err, result, fields) {
      if (err) throw err;
      if (!result.length) {
        db.query("SELECT uid FROM user WHERE email = ?", [email], function(err, result, fields) {
          if (err) throw err;
          if (!result.length) {
            return callback(false)
          } else {
            return callback(true);
          }
        });
      } else {
        return callback(true);
      }
    });
  },

  checkExist: function(username, callback) {
    console.log('checking username, email if exist');
    db.query("SELECT uid FROM user WHERE username = ?", [username], function(err, result, fields) {
      if (err) throw err;
      if (result.length) {
        return callback(true);
      } else {
        return callback(false);
      }
    });
  },

  checkLocation: function(lat, lng, callback) {
    return db.query("SELECT lid FROM location WHERE latitude = ? AND longitude = ?", [lat, lng], callback);
  },

  checkUid: function(username, callback) {
    return db.query("SELECT uid FROM user WHERE username = ?", [username], callback);
  },

  login: function(username, password, callback) {
    return db.query("SELECT uid FROM user WHERE username = ? AND password = ?", [username, password], callback);
  },

  addLocation: function(locationName, lat, lng, permanent, callback) {
    var currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO location VALUES (NULL, ?, ?, ?, ?, ?)", [locationName, lat, lng, currTime, permanent], function(err, result, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "lid = " + result.insertId + " posted";

        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            Query.checkLocation(lat, lng, function(err, rows) {
              if (err) throw err;
              return callback(rows);
            })
          });
        });
      });
    });
  },

  signUp: function(username, email, password, state, lid, city, callback) {
    var currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)", [username, email, password, state, currTime, lid, city], function(err, result, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "uid = " + result.insertId + " posted";

        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            Query.checkUid(username, function(err, rows) {
              if (err) throw err;
              var uid = rows[0].uid
              db.query("INSERT INTO tagrelation VALUES (NULL, 1)", function(err, result, fields) {
                if (err) throw err;
                var trid = result.insertId;
                db.query("INSERT INTO filter VALUES (?, ?, ?, ?, ?, 3)", [uid, trid, currTime, currTime, lid], function(err, result, fields) {
                  if (err) throw err;
                  return callback(uid);
                })
              })
            })
          });
        });
      });
    });
  },

  newSchedule: function(sname, startdate, enddate, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO schedule VALUES (NULL, ?, ?, ?, 0, 0, 0)", [sname, startdate, enddate], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "sid = " + result1.insertId + " posted";
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(result1.insertId);
          });
        });
      });
    });
  },

  addTag: function(tname, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO tag VALUES (NULL, ?)", [tname], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "tid = " + result1.insertId + " posted";
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(result1.insertId);
          });
        });
      });
    });
  },

  addTagRelation: function(tid, trid, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO tagrelation VALUES (?, ?)", [trid, tid], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = `tid = ${tid}, trid = ${trid} posted`;
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete1.');
            return callback(1);
          });
        });
      });
    });
  },

  newNote: function(uid, trid, ntext, lid, sid, privacy, callback) {
    var currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(uid, trid, ntext, lid, sid, privacy, currTime);
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO note VALUES (NULL, ?, ? ,? ,? ,?, ?, ?)", [uid, trid, ntext, currTime, lid, sid, privacy], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "nid = " + result1.insertId + " posted";
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.2');
            return callback(result1.insertId);
          });
        });
      });
    });
  },

  updateUser: function (username, state, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("UPDATE user SET state = ? WHERE username = ?", [state, username], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "uid = " + result1.insertId + " updated";
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(result1.insertId);
          });
        });
      });
    });
  },

  confirmfriend: function (uid, friendId, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("UPDATE friend SET confirmed = 1 WHERE uid =? AND friendid =?", [uid, friendId], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = `Friend confirmed uid=${uid} friendID=${friendId}`;
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(log);
          });
        });
      });
    });
  },

  addFriend: function (uid, friendId, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO friend VALUES (?, ?, 0)", [uid, friendId], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = `Friend insert uid=${uid} friendID=${friendId}`;
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(log);
          });
        });
      });
    });
  },

  getFilter: function(uid, callback) {
    return db.query("SELECT * FROM filter WHERE uid = ?", [uid], callback);
  },

  updateFilter: function(uid, startTimeString, endTimeString, fradius, callback) {
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      //       db.query("UPDATE filter SET fstarttime=?, fendtime=?, fradius =? WHERE uid = ?;", [startTimeString, endTimeString, fradius,uid], function(err, result1, fields) {
      db.query("UPDATE filter SET fradius =? WHERE uid = ?;", [fradius,uid], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = `Filter update uid=${uid}`;
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(log);
          });
        });
      });
    });
  },

  addComment: function(nid, uid, ctext, callback) {
    var currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.beginTransaction(function(err) {
      if (err) {
        throw err;
      }
      db.query("INSERT INTO `comment` VALUES (NULL, ?, ?, 0,?,?)", [nid, uid, ctext, currTime], function(err, result1, fields) {
        if (err) {
          db.rollback(function() {
            throw err;
          });
        }
        var log = "cid = " + result1.insertId + " posted";
        db.query('INSERT INTO log SET data=?', log, function(err, result) {
          if (err) {
            db.rollback(function() {
              throw err;
            });
          }
          db.commit(function(err) {
            if (err) {
              db.rollback(function() {
                throw err;
              });
            }
            console.log('Transaction Complete.');
            return callback(log);
          });
        });
      });
    });
  },

};

module.exports = Query;
