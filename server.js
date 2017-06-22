const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser')
var application = express();

application.engine('mustache', mustache());

application.set('views', './views');
application.set('view engine', 'mustache');

var storage = {
    users: [{ name: 'admin', password: 'qwer1234' }],
    missions: [],
    sessionId: 0,
    sessions: []
};
application.use(cookieParser());
application.use(bodyParser.urlencoded());

application.use((request, response, next) => {
    if (request.cookies.session !== undefined) {
        var sessionId = parseInt(request.cookies.session);
        var user = storage.sessions[sessionId];

        if (!user) {
            response.locals.user = { isAuthenticated: false };
        }
        else {
            response.locals.user = { isAuthenticated: true };
        }
    } else {
        response.locals.user = { isAuthenticated: false };
    }

    next();
});

application.get('/', (request, response) => {
    response.render('index');
});
application.get('/register', (request, response) => {
    response.render('register');
});
application.post('/register', (request, response) => {
    //todo: validation

    var user = {
        name: request.body.name,
        password: request.body.password
    }

    storage.users.push(user);

    //todo: sell information to microsoft
    response.redirect('/signin');
});
application.get('/signin', (request, response) => {
    response.render('signin');
});
application.post('/signin', (request, response) => {
    var name = request.body.name;
    var password = request.body.password;

    var user = storage.users.find(user => { return user.name === name && user.password === password })

    if (!user) {
        response.render('signin');
    } else {
        var sessionId = storage.sessionId;
        storage.sessionId++;
        storage.sessions.push(user);

        response.cookie('session', sessionId);

        response.redirect('/missions');
    }
});

application.get('/missions', (request, response) => {
    if (response.locals.user.isAuthenticated) {
        var model = { missions: storage.missions };
        response.render('missions', model);
    } else {
        response.redirect('signin');
    }
});
application.post('/missions', (request, response) => {

});
application.get('/missions/:missionId', (request, response) => {
    response.render('mission');
});
application.put('/missions/:missionId', (request, response) => {

});

application.listen(3000);