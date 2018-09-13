module.exports = function (pool) {
    //waiter queries
    async function allWaiters () {
        let result = await pool.query('select * from waiters');
        return result.rows;
    }
    async function countWaiters () {
        let result = await pool.query('select count(*) from waiters');
        return parseInt(result.rows[0].count);
    }
    async function selectWaiter(name) {
        let result = await pool.query('select * from waiters where first_name = $1', [name]);
        return result.rows;
    }
    async function getDays () {
        let result = await pool.query('select * from weekdays');
        return result.rows;
    }
    async function selectDay(day) {
        let result = await pool.query('select * from weekdays where day =$1', [day]);
        return result.rows;
    }
    async function insertShifts (userId, dayId) {
        await pool.query('insert into shifts (waiter_id, weekday_id) values ($1,$2)', [userId,dayId]);
    }
    async function allShifts () {
        let result = await pool.query('select * from shifts');
        return result.rows;
    }
    async function countAllShifts() {
        let result = await pool.query('select count(*) from shifts');
        return parseInt(result.rows[0].count);
    }
    async function getUserShifts(userId) {
        let result = await pool.query('select * from shifts where waiter_id = $1',[userId]);
        return result.rows;
    }
    async function addShifts(name, listData) {
        let userData = await selectWaiter(name);
        let employeeId = userData[0].id;
        for (var i = 0 ; i < listData.length ; i ++) {
            let selected = await selectDay(listData[i]);
            let dayId = selected[0].id;
            await insertShifts(employeeId,dayId);
        }
    }
    async function deleteUserDays(userId){
        await pool.query('delete from shifts where waiter_id = $1',[userId]);
    }
    async function selectShiftsUser (userId) {
        let result = await pool.query('select first_name,day from waiters join shifts on waiters.id = shifts.waiter_id join weekdays on shifts.weekday_id = weekdays.id where waiter_id=$1', [userId]);
        return result.rows;
    }
    return {
        allWaiters,
        getDays,
        selectWaiter,
        selectDay,
        countWaiters,
        getUserShifts,
        allShifts,
        countAllShifts,
        addShifts,
        deleteUserDays,
        selectShiftsUser
    }
}