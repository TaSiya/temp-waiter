module.exports = function (pool) {
    //waiter queries
    async function allWaiters() {
        let result = await pool.query('select * from waiters');
        return result.rows;
    }
    async function insertWaiter(name, pass) {
        await pool.query('insert into waiters (first_name,passcode) values ($1, $2)', [name, pass]);
    }
    async function countWaiters() {
        let result = await pool.query('select count(*) from waiters');
        return parseInt(result.rows[0].count);
    }
    async function selectWaiter(name) {
        let result = await pool.query('select * from waiters where first_name = $1', [name]);
        return result.rows;
    }
    async function getDays() {
        let result = await pool.query('select * from weekdays');
        return result.rows;
    }
    async function countingShifts(shifts) {
        let temp = [];
        for (let i = 0; i < 7; i++) {
            var counter = 0;
            for (let j = 0; j < shifts.length; j++) {
                if (i + 1 === shifts[j].weekday_id) {
                    counter++;
                }
            }
            temp.push(counter);
        }
        return temp;
    }
    async function filterColors() {
        let shifts = await allShifts();
        let result = await countingShifts(shifts);
        for (var i = 0; i < result.length; i++) {
            var day = await getDayById(i + 1);
            if (result[i] == 0) {
                await updateStatus('empty', day);
            } else if (result[i] < 3) {
                await updateStatus('short', day);
            } else if (result[i] == 3) {
                await updateStatus('full', day);
            } else {
                await updateStatus('over', day);
            }
        }
    }

    async function updateStatus(colour, day) {
        await pool.query('update weekdays set status=$1 where day=$2', [colour, day]);
    }
    async function selectDay(day) {
        let result = await pool.query('select * from weekdays where day =$1', [day]);
        return result.rows;
    }
    async function insertShifts(userId, dayId, box) {
        await pool.query('insert into shifts (waiter_id, weekday_id) values ($1,$2)', [userId, dayId]);
    }
    async function allShifts() {
        let result = await pool.query('select * from shifts');
        return result.rows;
    }
    async function countAllShifts() {
        let result = await pool.query('select count(*) from shifts');
        return parseInt(result.rows[0].count);
    }
    async function getUserShifts(userId) {
        let result = await pool.query('select * from shifts where waiter_id = $1', [userId]);
        return result.rows;
    }
    async function addShifts(name, listData) {
        let userData = await selectWaiter(name);
        let employeeId = userData[0].id;
        for (var i = 0; i < listData.length; i++) {
            let selected = await selectDay(listData[i]);
            let dayId = selected[0].id;
            if (listData[i] == selected[0].day) {
                await insertShifts(employeeId, dayId); //deleted the checked param
            }
        }
    }
    async function deleteUserDays(userId) {
        await pool.query('delete from shifts where waiter_id = $1', [userId]);
    }
    async function clearCheck() {
        await pool.query('alter table weekdays drop box');
        await pool.query('alter table weekdays add box text');
    }
    async function selectShiftsUser(userId) {
        let result = await pool.query('select first_name,day,box from waiters join shifts on waiters.id = shifts.waiter_id join weekdays on shifts.weekday_id = weekdays.id where waiter_id=$1', [userId]);
        return result.rows;
    }
    async function selectDaysInJoinedTables(day) {
        let result = await pool.query('select first_name,day from waiters join shifts on waiters.id = shifts.waiter_id join weekdays on shifts.weekday_id = weekdays.id where day=$1', [day]);
        return result.rows;
    }
    async function getAllShifts () {
        let result = await pool.query('select first_name,day from waiters join shifts on waiters.id = shifts.waiter_id join weekdays on shifts.weekday_id = weekdays.id');
        return result.rows;
    }
    async function getDayById(dayId) {
        let result = await pool.query('select day from weekdays where id = $1', [dayId]);
        return result.rows[0].day;
    }
    async function resetShifts() {
        await pool.query('delete from shifts');
    }
    async function keepCheck(userData) {
        var selectedDays = await selectShiftsUser(userData[0].id);
        let weekdays = await getDays();
        for (var i = 0; i < selectedDays.length; i++) {
            for (var j = 0; j < weekdays.length; j++) {
                if (selectedDays[i].day === weekdays[j].day) {
                    weekdays[j].box = 'checked';
                }
            }
        }
        return weekdays;
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
        selectShiftsUser,
        selectDaysInJoinedTables,
        countingShifts,
        getDayById,
        filterColors,
        insertWaiter,
        resetShifts,
        clearCheck,
        keepCheck,
        getAllShifts
    }
}