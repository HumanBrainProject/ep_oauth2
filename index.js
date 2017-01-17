var ERR = require('async-stacktrace');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
var request = require('request');

// var settings = require('ep_etherpad-lite/node/utils/Settings').ep_oauth2;
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

// Environment Variables
var authorizationURL = process.env['EP_OAUTH2_AUTHORIZATION_URL'] || settings.users.oauth2.authorizationURL;
var tokenURL = process.env['EP_OAUTH2_TOKEN_URL'] || settings.users.oauth2.tokenURL;
var clientID = process.env['EP_OAUTH2_CLIENT_ID'] || settings.users.oauth2.clientID;
var clientSecret = process.env['EP_OAUTH2_CLIENT_SECRET'] || settings.users.oauth2.clientSecret;
var publicURL = process.env['EP_OAUTH2_PUBLIC_URL'] || settings.users.oauth2.publicURL;
var userinfoURL = process.env['EP_OAUTH2_USERINFO_URL'] || settings.users.oauth2.userinfoURL;
var usernameKey = process.env['EP_OAUTH2_USERNAME_KEY'] || settings.users.oauth2.usernameKey;
var idKey = process.env['EP_OAUTH2_USERID_KEY'] || settings.users.oauth2.useridKey;
var scope = process.env['EP_OAUTH2_SCOPE'] || settings.users.oauth2.scope;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


function setUsername(token, username) {
  console.debug('oauth2.setUsername: getting authorid for token %s', token);
  authorManager.getAuthor4Token(token, function(err, author) {
    if (ERR(err)) {
      console.debug('oauth2.setUsername: could not get authorid for token %s', token);
    } else {
      console.debug('oauth2.setUsername: have authorid %s, setting username to "%s"', author, username);
      authorManager.setAuthorName(author, username);
    }
  });
  return;
}

exports.expressConfigure = function(hook_name, context) {
  console.log('oauth2-expressConfigure');
  passport.use('hbp', new OAuth2Strategy({
    authorizationURL: authorizationURL,
    tokenURL: tokenURL,
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: publicURL + '/auth/callback',
    scope: scope
  }, function(accessToken, refreshToken, profile, cb) {
    request.get({
      url: userinfoURL,
      auth: {
        bearer: accessToken
      },
      json: true
    }, function (error, response, data) {
      if (error) {
        return cb(error);
      }
      data.token = {
        type: 'bearer',
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      authorManager.createAuthorIfNotExistsFor(data[idKey], data[usernameKey], function(err, authorId) {
        if (err) {
          return cb(err);
        }
        data.authorId = authorId;
        return cb(null, data);
      });
    });
  }));
  var app = context.app;
  app.use(passport.initialize());
  app.use(passport.session());
}

exports.expressCreateServer = function (hook_name, context) {
  console.info('oauth2-expressCreateServer');
  var app = context.app;
  app.get('/auth/callback', passport.authenticate('hbp', {
    failureRedirect: '/auth/failure'
  }), function(req, res) {
    req.session.user = req.user;
    res.redirect(req.session.afterAuthUrl);
  });
  app.get('/auth/failure', function(req, res) {
    res.send("<em>Authentication Failed</em>")
  });
  app.get('/auth/done', function(req, res) {
    res.send("<em>Authentication Suceeded</em>");
  });
}

exports.authenticate = function(hook_name, context) {
  console.info('oauth2-authenticate from ->', context.req.url);
  context.req.session.afterAuthUrl = context.req.url;
  return passport.authenticate('hbp')(context.req, context.res, context.next);
}

exports.handleMessage = function(hook_name, context, cb) {
  console.debug("oauth2.handleMessage");
  if ( context.message.type == "CLIENT_READY" ) {
    if (!context.message.token) {
      console.debug('oauth2.handleMessage: intercepted CLIENT_READY message has no token!');
    } else {
      var client_id = context.client.id;
      if ('user' in context.client.client.request.session) {
        var displayName = context.client.client.request.session.user[usernameKey];
        console.debug('oauth2.handleMessage: intercepted CLIENT_READY message for client_id = %s, setting username for token %s to %s', client_id, context.message.token, displayName);
        setUsername(context.message.token, displayName);
      }
      else {
        console.debug('oauth2.handleMessage: intercepted CLIENT_READY but user does have displayName !');
      }
    }
  } else if ( context.message.type == "COLLABROOM" && context.message.data.type == "USERINFO_UPDATE" ) {
    console.debug('oauth2.handleMessage: intercepted USERINFO_UPDATE and dropping it!');
    return cb([null]);
  }
  return cb([context.message]);
};
