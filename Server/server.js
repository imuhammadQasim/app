const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const server = require('./app');

const db = require('./config/dbConfig');
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})