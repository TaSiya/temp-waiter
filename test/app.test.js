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
            it('check if Andre is a employee', async function () {
                let waiters = Service(pool);
                let userData = await waiters.selectWaiter('Andre');
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
        })
    });
    
    after(function() {
        pool.end();
    })
});