const cron = require('node-cron');
const { getConnection } = require('../db');
const { logMailer } = require('../logMailer');
const LogEmail = require('../models/LogEmail');
const colors = require('colors');
  
async function checkWebsite() {
  const conn = getConnection();

  try {
    const response = await fetch('https://httpstat.us/500/', { method: 'HEAD' });

    if (response.ok) {
      console.log('The server is up'.green.inverse);
    } else {
      console.error('The server is down'.red.inverse);

      const errorMessage = 'The server at https://httpstat.us/500/ is down.';

      // Log the error in the database
      const log = new LogEmail(undefined, errorMessage);
      await log.insert(conn);

      // Send a logging email
      await logMailer(conn);
    }
  } 
  catch (error) {
    console.error('Error:', error);

    const errorMessage = `Failed to reach https://httpstat.us/500/. Error: ${error.message}`;

    // Log the error in the database
    const log = new LogEmail(undefined, errorMessage);
    await log.insert(conn);

    // Send a logging email
    await logMailer(conn);
  } finally {
    if (conn.close) {
      await conn.close();
    }
  }
}

// Schedule the task to run every hour
// cron.schedule('0 * * * *', () => {
//   console.log('Running website status check...');
//   checkWebsite();
// });

checkWebsite();