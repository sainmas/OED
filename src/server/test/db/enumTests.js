/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Meter = require('../../models/Meter');
const User = require('../../models/User');
const Unit = require('../../models/Unit');

const Database = require('../../models/database');
const DB = require('../../db');
const { expectArrayOfUnitsToBeEquivalent } = require('../../util/compareUnits');
const { mocha, expect } = require('../common');

mocha.describe('Enums JS to DB', () => {
    //meter_type ENUM
	mocha.it('can equate Meter.type to SQL enum', async () => {
		const conn = DB.getConnection();
		let serverEnum = [];
		let jsObject = [];
		await conn.result('SELECT unnest(enum_range(NULL::meter_type));')
			.then(data => {
				let resultArray = data.rows;
				resultArray.forEach((item) =>{
					serverEnum.push(item.unnest);
				});
				for(let key in Meter.type) {
					if (Meter.type.hasOwnProperty(key)) {
						let value = Meter.type[key];
						jsObject.push(value);
					}
				}
				serverEnum.sort();
				jsObject.sort();
				expect(serverEnum.length).to.equal(jsObject.length);
				expect(serverEnum.toString()).to.equal(jsObject.toString());
			}
        )
	})

    //displayable_type ENUM
	mocha.it('can equate displayableType to SQL enum', async () => {
		const conn = DB.getConnection();
		let serverEnum = [];
		let jsObject = [];
		await conn.result('SELECT unnest(enum_range(NULL::displayable_type));')
			.then(data => {
				let resultArray = data.rows;
				resultArray.forEach((item) =>{
					serverEnum.push(item.unnest);
				});
				for(let key in Unit.displayableType) {
					if (Unit.displayableType.hasOwnProperty(key)) {
						let value = Unit.displayableType[key];
						jsObject.push(value);
                    }
				}
				serverEnum.sort();
				jsObject.sort();
				expect(serverEnum.length).to.equal(jsObject.length);
				expect(serverEnum.toString()).to.equal(jsObject.toString());
			}
        )
	})

    //USER_TYPE ENUM
    //checked length first
    //need to add sql file to the testing folder 
	mocha.it('can equate User.role to SQL enum', async () => {
        const conn = DB.getConnection();
        let serverEnum = [];
        let jsObject = [];
        await conn.result('SELECT unnest(enum_range(NULL::user_type));')
            .then(data => {
                let resultArray = data.rows;
                resultArray.forEach((item) =>{
                    serverEnum.push(item.unnest);
                });
                for(let key in User.role) {
                    if (User.role.hasOwnProperty(key)) {
                        let value = User.role[key];
                        jsObject.push(value);
                    }
                }
                serverEnum.sort();
                jsObject.sort();
                expect(serverEnum.length).to.equal(jsObject.length);
                expect(serverEnum.toString()).to.equal(jsObject.toString());
            }
        )
    })

    //AREA_UNIT_TYPE
	mocha.it('can equate Unit.areaUnitType to SQL enum', async () => {
        const conn = DB.getConnection();
        let serverEnum = [];
        let jsObject = [];
        await conn.result('SELECT unnest(enum_range(NULL::area_unit_type));')
            .then(data => {
                let resultArray = data.rows;
                resultArray.forEach((item) =>{
                    serverEnum.push(item.unnest);
                });
                for(let key in Unit.areaUnitType) {
                    if (Unit.areaUnitType.hasOwnProperty(key)) {
                        let value = Unit.areaUnitType[key];
                        jsObject.push(value);
                    }
                }
                serverEnum.sort();
                jsObject.sort();
                expect(serverEnum.length).to.equal(jsObject.length);
                expect(serverEnum.toString()).to.equal(jsObject.toString());
            }
        )
    })

    //test unit_types
    mocha.it('can equate unit.unitType to SQL enum', async () => {
        const conn = DB.getConnection();
        let serverEnum = [];
        let jsEnum = [];
        await conn.result('SELECT unnest(enum_range(NULL::unit_type));')
            .then(data => {
                //need sql inlin code for getting unit enum SELECT unnest(enum_range(NULL::unit_type));
                let resultArray = data.rows;
                resultArray.forEach((item) =>{
                    serverEnum.push(item.unnest);
                });
                for(let key in Unit.unitType) {
                    if (Unit.unitType.hasOwnProperty(key)) {
                        let value = Unit.unitType[key];
                        jsEnum.push(value);
                    }
                }
                serverEnum.sort();
                jsEnum.sort();
                expect(serverEnum.length).to.equal(jsEnum.length);
                expect(serverEnum.toString()).to.equal(jsEnum.toString());
            }
        )
    })
});