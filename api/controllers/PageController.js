"use strict";

/*global sails*/
/**
* PageController
* servers the pages requried
*/

module.exports = {
    index: function (req, res) {
        res.send("Page is served");
    }//eo index
};
