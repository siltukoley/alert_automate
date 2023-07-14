const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.bmswc = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.send({
            message: "no data available"
          });
     } else {
        res.send(req.body.sr_no);
     }
};

