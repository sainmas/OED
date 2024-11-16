/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
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