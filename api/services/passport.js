var passport         = require('passport');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt           = require('bcrypt');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ id: id } , function (err, user) {
        done(err, user);
    });
});

/**
 * LocalStrategy
 */
passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
}, function(email, password, done){

	User.findOne({email:email}, function(err, user){
		
		if(err) return done(err);

		if(!user){
			return done(null, false, {message: sails.__('Email is incorrect')});
		}

		bcrypt.compare(password, user.password, function(err, res){

			if(!res){
				return done(null, false, {message: sails.__('Invalid password')});
			}

			return done(null, {
				email: user.email,
				id: user.id
			}, {
				message: 'Login succeed'
			});
		});
	});
}));
//eo LocalStrategy

/**
 * Facebook Strategy
 */
passport.use(new FacebookStrategy({
	clientID:     sails.config.Facebook.clientID,
    clientSecret: sails.config.Facebook.clientSecret,
    callbackURL:  sails.config.Facebook.callbackURL,
    enableProof:  sails.config.Facebook.enableProof
}, function(accessToken, refreshToken, profile, done){
	User.findOne({facebookId:profile.id}, function(err, user){
		if(!user){
			return done(err, false, {message: sails.__("Invalid user. Please info system admin.")});
		}

		if(user.type === 'usual'){
			return done(err, false, {message: sails.__("Invalid user permission.")});
		} 

		return done(null, {
			fb_id: user.facebookId,
			email: user.email,
			id:    user.id
		}, {
			message: 'Login succeed'
		});
	});
}));