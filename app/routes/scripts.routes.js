module.exports = app => {
    const scripts = require("../controllers/scripts.controller.js");
  
    var router = require("express").Router();
  
    router.post("/bmswc", scripts.bmswc);
  
    app.use('/api/scripts', router);
  };