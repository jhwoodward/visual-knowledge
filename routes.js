var express = require('express');
var router = express.Router();



router.route('/app/*').get(function (req, res) {
    
    res.sendFile('client/index.html', { root: __dirname });

});

module.exports = router;