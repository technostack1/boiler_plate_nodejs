const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require("path");

const cookieParser = require("cookie-parser");

const app = express();
const server = require('http').createServer(app);
const useragent = require('express-useragent');

app.use(useragent.express());


const helmet = require('helmet')
app.set('superSecret', 'nodeIsFuture');


process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = require('./config/environment');
const db = require('./config/dbConnection');
const env = app.get('env');
const ejs = require("ejs");

app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.frameguard());

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


if (env === 'production') {
    app.use(morgan('dev'));

}


if (env === 'development') {
    app.use(morgan('dev'));
}


require('./routes')(app);

server.listen(config.port, config.ip, () => {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));

});