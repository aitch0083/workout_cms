"use strict";

/**
 * AuthController
 *
 * @description :: Auth Controller, for authentification
 */
var passport = require('passport');

module.exports = {
    
    _config: {
        rest: false,
        shortcuts: false,
        actions: false
    },
    
    login: function(req, res){
        // var auth_type = req.body['auth_type'] || 'local';
        
        passport.authenticate('local', function(err, user, info){
            if(err || !user){
                return res.send({
                    message: info.message,
                    user: user
                });
            }
            
            req.logIn(user, function(err){
                if(err){ res.send(err); }
                
                req.session.user = user;
                res.redirect('/dashboard');
            });
        })(req, res);
    },//eo login

    fb_login: function(req, res, next){
        passport.authenticate('facebook', {scope: ['email', 'public_profile']}, 
        function(err, user){
            if(err){
                return res.send(err);
            }

            req.logIn(user, function(err, res){
                if(err){
                    req.session.flash = sails.__('Unable to login via Facebook');
                    res.redirect('/admin/login');
                } else {
                    req.session.user = user;
                    res.redirect('/dashboard');
                }
            });
        })(req, res, next);
    },//eo fb_login

    fb_callback: function(req, res, next){
        passport.authenticate('facebook', {scope: ['email', 'public_profile']}, 
        function(err, user){

            // console.info('user:', user);
            
            req.logIn(user, function(err){
                if(err){
                    req.session.flash = sails.__('Unable to login via Facebook');
                    res.redirect('/admin/login');
                } else {
                    req.session.user = user;
                    res.redirect('/dashboard');
                }
            });

        })(req, res, next);
    },
    
    logout: function(req, res){
        req.logout();
        res.redirect('/admin/login');
    }
};

