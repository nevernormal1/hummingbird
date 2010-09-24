require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);
require.paths.unshift(__dirname + '/deps/express/lib')
require.paths.unshift(__dirname + '/deps/express/support')

var sys = require('sys'),
  fs = require('fs'),
  mongo = require('deps/node-mongodb-native/lib/mongodb'),
  svc = require('service_json'),
  weekly = require('weekly'),
  express = require('express'),
  app = express.createServer();

db = new mongo.Db('hummingbird', new mongo.Server('localhost', 27017, {}), {});

db.open(function(p_db) {
  app.configure(function(){
    app.set('root', __dirname);
    app.set('db', db);
    app.use(express.logger());
    app.use(express.staticProvider());
    app.use(express.bodyDecoder());
    app.use(express.cookieDecoder());

    try {
      var configJSON = fs.readFileSync(__dirname + "/config/app.json");
    } catch(e) {
      sys.log("File config/app.json not found.  Try: `cp config/app.json.sample config/app.json`");
    }

    sys.log("Started server with config: ");
    sys.puts(configJSON);
    var config = JSON.parse(configJSON.toString());

    for(var i in config) {
      app.set(i, config[i]);
    }

  });

  app.get('/', function(req, res){
    //authenticate(req, res);
    res.render('index.html.ejs', {
      locals: {
        name: app.set('name')
      }
    });
  });

  app.get('/weekly', function(req, res) {
    //authenticate(req, res);
    res.render('weekly.html.ejs');
  });

  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      locals: {
        name: app.set('name')
      }
    });
  });

  app.post('/login', function(req, res) {
    if(req.param('password') == app.set('password')) {
      //req.cookies('not_secret', req.param('password'));

      sys.log("Auth succeeded for " + req.param('username'));
      res.redirect('/');
    } else {
      sys.log("Auth failed for " + req.param('username'));
      res.redirect('/login');
    }
  });

  app.get('/sale_list', function(req, res) {
    //authenticate(req, res);

    if(app.set('sales_uri')) {
      svc.fetchJSON(app.set('sales_uri'), function(data) {
        res.contentType('json');
        res.send(data, 200);
      });
    } else {
      res.send("No sales uri", 500);
    }
  });

  app.get('/week.json', function(req, res) {
    //authenticate(req, res);
    weekly.findByDay(Express.settings['db'], function(data) {
      res.contentType('json');
      res.send(data, 200);
    });
  });

  app.listen(app.set("monitor_port"));
});

var authenticate = function(req, res) {
  if(app.set('password') != req.cookies['not_secret']) {
    res.redirect('/login');
  }
};
