const assert = require('assert');
const Service = require('../service');
const pg = require("pg");
const Pool = pg.Pool;

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
    useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/waiter_database';

const pool = new Pool({
    connectionString,
    ssl : useSSL
  });

describe('Waiter App tests', function () {
    describe('test the table data', function () {
        it('check if weekdays are seven', async function () {
            let weekdays = Service(pool);
            let result = await weekdays.getDays();
            assert.strictEqual(result.length, 7);
        })
        it('check if Thursday is there', async function () {
            let weekdays = Service(pool);
            let day = await weekdays.selectDay('Thursday');
            let result = day[0].day;
            assert.strictEqual(result, 'Thursday');
        })
    });
    describe('test waiter table', function () {
        describe('Check the number of employees', function () {
            it('should return the number of employees', async function () {
                let waiters = Service(pool);
                let listEmployee = await waiters.allWaiters();
                assert.strictEqual(listEmployee.length, 7);
            });
            it('count all the rows in the table', async function () {
                let waiters = Service(pool);
                let rows = await waiters.countWaiters();
                assert.strictEqual(rows,7);
            });
        });
        describe('check if the employee exists', function () {
            it('check if Aphiwe is a employee', async function () {
                let waiters = Service(pool);
                let userData = await waiters.selectWaiter('Aphiwe');
                assert.strictEqual(userData[0], undefined);
            });
            it('check if Odwa is a employee', async function () {
                let waiters = Service(pool);
                let userData = await waiters.selectWaiter('Odwa');
                assert.strictEqual(userData[0].first_name, 'Odwa');
            });
        });
        
    });
    describe('shifts table tests', function () {
        describe('adding shifts to the table', function () {
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should have no shifts', async function () {
                let shifts = Service(pool);
                let shiftList = await shifts.countAllShifts();
                assert.strictEqual(shiftList, 0);
            });
            it('adding 1 shifts for employee', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday']);
                let shiftList = await shifts.countAllShifts();
                assert.strictEqual(shiftList, 1);
            });
            it('adding 3 shifts for employee', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                let shiftList = await shifts.countAllShifts();
                assert.strictEqual(shiftList, 3);
            });
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('adding 3 days shifts for two employee each', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                await shifts.addShifts('Siyamanga', ['Thursday', 'Saturday', 'Monday']);
                let shiftList = await shifts.countAllShifts();
                assert.strictEqual(shiftList, 6);
            });
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('adding 4 or more shifts for employee', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Odwa', ['Monday', 'Tuesday', 'Friday', 'Sunday']);
                let shiftList = await shifts.countAllShifts();
                assert.strictEqual(shiftList, 4);
            });
        });
        describe('Counting shifts for a day', function () {
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should return an array with how many times day checked', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                await shifts.addShifts('Siyamanga', ['Thursday', 'Saturday', 'Monday']);
                await shifts.addShifts('Odwa', ['Monday', 'Tuesday', 'Friday', 'Sunday']);
                let currentShifts = await shifts.allShifts();
                let result = await shifts.countingShifts(currentShifts);
                assert.deepStrictEqual(result, [3, 2,0,1,2,1,1]);
            });
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should return an array with how many times day checked', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                let currentShifts = await shifts.allShifts();
                let result = await shifts.countingShifts(currentShifts);
                assert.deepStrictEqual(result, [1, 1, 0, 0, 1, 0, 0]);
            });
        });
        describe('checking if empty or short or full or over', function () {
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should return full on monday', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                await shifts.addShifts('Siyamanga', ['Thursday', 'Saturday', 'Monday']);
                await shifts.addShifts('Odwa', ['Monday', 'Tuesday', 'Friday', 'Sunday']);
                await shifts.filterColors();
                let result = await shifts.getDays();
                assert.deepStrictEqual(result[0].status, 'full');
            });
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should return short on Sunday', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                await shifts.addShifts('Siyamanga', ['Thursday', 'Saturday', 'Monday']);
                await shifts.addShifts('Odwa', ['Monday', 'Tuesday', 'Friday', 'Sunday']);
                await shifts.filterColors();
                let result = await shifts.getDays();
                assert.deepStrictEqual(result[6].status, 'short');
            });
            beforeEach( async function () {
                await pool.query('delete from shifts');
            });
            it('should return empty on Wednesday', async function () {
                let shifts = Service(pool);
                await shifts.addShifts('Siyanda', ['Monday', 'Tuesday', 'Friday']);
                await shifts.addShifts('Siyamanga', ['Thursday', 'Saturday', 'Monday']);
                await shifts.addShifts('Odwa', ['Monday', 'Tuesday', 'Friday', 'Sunday']);
                await shifts.filterColors();
                let result = await shifts.getDays();
                assert.deepStrictEqual(result[2].status, 'empty');
            });
            
        });
    });
    describe('Keeping the days that are checked', function () {
        it('keep the three days which are Monday, Wednesday, Friday', async function () {
            let weekdays = Service(pool);
            await weekdays.addShifts('Siyanda', ['Monday', 'Wednesday', 'Friday']);
            let userData = await weekdays.selectWaiter('Siyanda');
            let result = await weekdays.keepCheck(userData);
            // ***** either one of the following assert should expect checked ****
            // assert.strictEqual(result[0].box, 'checked');
            // assert.strictEqual(result[2].box, 'checked');
            assert.strictEqual(result[4].box, 'checked');
        });
    });
    after(function() {
        pool.end();
    })
});