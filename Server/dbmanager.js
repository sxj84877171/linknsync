var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var dbconfig = require('./dbconfig.js');

function DBManager() {

}
util.inherits(DBManager, EventEmitter);

DBManager.prototype.init = function() {
  var pool = mysql.createPool({
    connectionLimit: dbconfig.connectionLimit,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password
  });

  var that = this;
  pool.getConnection(function(err, connection) {
    this.ready = false;
    if (err) {
      console.log('getConnection err', err);
      return;
    }

    connection.query('\
    CREATE DATABASE IF NOT EXISTS nanao\
      DEFAULT CHARACTER SET utf8\
      DEFAULT COLLATE utf8_general_ci;', function(err, rows, fields) {
      if (err) {
        that.emit('error', 'fail to create database nanao');
      } else {
        connection.query('USE nanao;', function(err, rows, fields) {
          if (err) {
            that.emit('error', 'fail to select database nanao');
          } else {
            connection.query('\
            CREATE TABLE IF NOT EXISTS device (\
              id INT PRIMARY KEY AUTO_INCREMENT,\
              imei CHAR(15) UNIQUE NOT NULL,\
              name CHAR(20) NOT NULL,\
              sdklevel TINYINT\
            );', function(err, rows, fields) {
              if (err) {
                that.emit('error', 'fail to create table device');
              }
            });

            connection.query('\
            CREATE TABLE IF NOT EXISTS source (\
              id INT PRIMARY KEY AUTO_INCREMENT,\
              deviceid INT NOT NULL,\
              local CHAR(21) NOT NULL,\
              public CHAR(21) NOT NULL,\
              time BIGINT NOT NULL\
            );', function(err, rows, fields) {
              if (err) {
                that.emit('error', 'fail to create table source');
              }
            });

            connection.query('\
            CREATE TABLE IF NOT EXISTS client (\
              id INT PRIMARY KEY AUTO_INCREMENT,\
              token BINARY(16) NOT NULL,\
              public CHAR(21) NOT NULL,\
              time BIGINT NOT NULL\
            );', function(err, rows, fields) {
              if (err) {
                that.emit('error', 'fail to create table client');
              }
            });

            connection.query('\
            CREATE TABLE IF NOT EXISTS pair (\
              id INT PRIMARY KEY AUTO_INCREMENT,\
              sourceid INT NOT NULL,\
              clientid INT NOT NULL,\
              time BIGINT NOT NULL\
            );', function(err, rows, fields) {
              if (err) {
                that.emit('error', 'fail to create table pair');
              } else {
                that.ready = true;
                that.emit('ready');
              }

              connection.release();
            });
          }
        });
      }
    });
  });

  this.pool = pool;
}

DBManager.prototype.query = function (sql, callback) {
    this.pool.query(sql, callback);
}

var ERROR_NOT_READY = new Error('DBManager was not ready');

DBManager.prototype.getDeviceID = function(device, next) {
  if (this.ready) {
    if (device.imei) {
      var that = this;
      this.getDeviceByIMEI(device.imei, function(err, deviceInDB) {
        if (err) {
          next(err);
        } else if (deviceInDB) {
          next(null, deviceInDB.id);
        } else {
          that.addDevice(device, function(err, id) {
            if (err) {
              next(err);
            } else if (id) {
              next(null, id);
            }
          });
        }
      });
    } else {
      next(new Error('invalid device'));
    }
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getDeviceByID = function(id, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.device\
    WHERE id = ' + id, function(err, rows, fields) {
      if (err) {
        next(err);
      } else if (rows.length > 0) {
        next(null, rows[0]);
      } else {
        next(null, null);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getDeviceByIMEI = function(imei, next) {
  if (this.ready) {
    this.pool.query(util.format('\
    SELECT *\
    FROM nanao.device\
    WHERE imei = "%s"', imei), function(err, rows, fields) {
      if (err) {
        next(err);
      } else if (rows.length > 0) {
        next(null, rows[0]);
      } else {
        next(null, null);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.addDevice = function(device, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    INSERT INTO nanao.device (imei, name, sdklevel)\
    VALUES ('%s', '%s', '%s');", device.imei, device.name, device.sdklevel),
    function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows.insertId);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getSourceByID = function(id, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.source\
    WHERE id = ' + id, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getSourceByDeviceID = function(deviceid, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.source\
    WHERE deviceid = ' + deviceid, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getSourceByLocal = function(local, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    SELECT *\
    FROM nanao.source\
    WHERE local = '%s'", local), function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getSourceByPublic = function(public, next) {
  if (this.ready) {
    this.pool.query("\
    SELECT *\
    FROM nanao.source\
    WHERE public = '%s'" + public, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.addSource = function(source, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    INSERT INTO nanao.source (deviceid, local, public, time)\
    VALUES ('%s', '%s', '%s', %d);", source.deviceid, source.local, source.public, new Date().getTime()),
    function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows.insertId);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getClientByID = function(id, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT id, HEX(token), public, time\
    FROM nanao.client\
    WHERE id = ' + id, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getClientByToken = function(token, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    SELECT id, HEX(token), public, time\
    FROM nanao.client\
    WHERE token = '%s'", token), function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getClientByAddress = function(address, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    SELECT id, HEX(token), public, time\
    FROM nanao.client\
    WHERE address = '%s'", address), function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.addClient = function(client, next) {
  if (this.ready) {
    this.pool.query(util.format("\
    INSERT INTO nanao.client (token, public, time)\
    VALUES (UNHEX('%s'), '%s', %d);", client.token, client.public, new Date().getTime()),
    function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows.insertId);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getPairByID = function(id, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.pair\
    WHERE id = ' + id, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getPairBySourceID = function(sourceid, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.pair\
    WHERE sourceid = ' + sourceid, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.getPairByClientID = function(clientid, next) {
  if (this.ready) {
    this.pool.query('\
    SELECT *\
    FROM nanao.pair\
    WHERE clientid = ' + clientid, function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.addPair = function(sid, cid, next) {
  if (this.ready) {
    var values = util.format('', sid, cid, new Date().getTime());
    this.pool.query(util.format("\
    INSERT INTO nanao.pair (sourceid, clientid, time)\
    VALUES (%d, %d, %d);", sid, cid, new Date().getTime()),
    function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        next(null, rows.insertId);
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

DBManager.prototype.terminate = function(next) {
  if (this.ready) {
    var that = this;
    this.pool.query('DROP DATABASE nanao;', function(err, rows, fields) {
      if (err) {
        next(err);
      } else {
        that.ready = false;
        that.emit('terminated');
        next();
      }
    });
  } else {
    next(ERROR_NOT_READY);
  }
}

module.exports = DBManager;
