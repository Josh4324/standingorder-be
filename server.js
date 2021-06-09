const express = require('express');
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const routes = require('./routes/index.routes');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const cron = require('./cron');

app.use('/receipts', express.static('receipts'))

app.use(morgan("common"));
app.use(cors());
app.use(helmet());
app.set('trust proxy', 1);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));


app.use('/', routes);



cron();

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function errorHandler(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({ error: res.locals.message });
});

const port = process.env.PORT || 4110;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
