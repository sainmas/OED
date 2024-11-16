const Meter = require('../../models/Meter');
const Database = require('../../models/database');
const DB = require('../../db');

try {
    const conn = DB.getConnection();
    conn.result(Database.sqlFile('meter/get_meter_enum.sql')).then(data => {
        let resultArray = data.rows;
        resultArray.forEach((item) =>{
            console.log(item.unnest);
        });
        //console.log(resultArray.length);
    }).catch(err => {
            console.log(err);
        }
    );
}
catch(err) {
    console.log.error(`Error while performing database test ${err}`, err);
}