module.exports = function (pool) {
    //waiter queries
    async function allWaiters () {
        let result = await pool.query('select * from waiters');
        return result.rows;
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
        let result = await pool.query('select ')
    }
    async function addShifts(name, listData) {
        let userData = await selectWaiter(name);
        for (var i = 0 ; i < listData.length ; i ++) {
            if(listData[i].checked) {
                let
            }
        }
    }

    return {
        allWaiters,
        getDays,
        selectWaiter
    }
}