module.exports = function(app){
    const data = require('../controllers/dataController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/vaccines-city',  data.getVaccine);
    app.get('/vaccines-data',data.getChrome);
    app.get('/news',data.getNews);
    app.get('/instructions',data.getInstructions);
    app.get('/vaccines-all',data.getVaccineData);
};