"use strict";

/**
 * User.js
 *
 * @description :: User model
 */
var bcrypt = require('bcrypt');

module.exports = {

  //connection: "mysqlConnection",

  tableName: 'users',

  attributes: {
      email: {
          type: "email",
          required: true,
          unique: true
      },
      password: {
          type: "string",
          required: true,
          minLength: 6
      },
      facebookId: {
          type: 'string',
          required: true,
          unique: true,
          columnName: 'fb_id'
      },
      createdAt:{
          type: 'datetime',
          columnName: 'created'
      },
      updatedAt:{
          type: 'datetime',
          columnName: 'modified'
      },
      createdBy:{
          type: 'integer',
          columnName: 'user_id'
      },
      toJSON: function(){
          var user = this.toObject();
          delete user.password;
          return user;
      }
  },
  
  beforeCreate: function(user, cb){
    bcrypt.genSalt(sails.config.bcrypt.round, function(err, salt){
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err){
                consol.log("Error:", err);
                cb(err);
            } else {
                user.password = hash;
                cb();
            }
        });
    });
  }
};

