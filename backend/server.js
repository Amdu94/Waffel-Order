const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('frontend'));

const apiRouter = require('./routes/api');

app.use('/api', apiRouter);

const port = 9001;
app.listen(port, () => console.log(`http://127.0.0.1:${port}`));
