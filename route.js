module.exports = function (service) {
    async function home(req, res) {
        try {
            let user = req.params.username;
            let userData = await service.selectWaiter(user);
            if (userData.length != 0) {
                var selectedDays = await service.selectShiftsUser(userData[0].id);
                let weekdays = await service.keepCheck(userData);
                res.render('index', {
                    user,
                    selectedDays,
                    weekdays
                })
            } else {
                res.render('notEmployed', {
                    user
                });
            }
        } catch (err) {
            res.send(err.stack);
        }
    }
    async function checkingDays(req, res) {
        try {
            let user = req.params.username;
            let shifts = req.body.weekdays;
            console.log(shifts);
            let userData = await service.selectWaiter(user);
            let check = Array.isArray(shifts);
            if (userData.length != 0) {
                if (!check) {
                    req.flash('noShifts', 'Not enough shifts');
                    let selectedDays = await service.selectShiftsUser(userData[0].id);
                    let weekdays = await service.keepCheck(userData);
                    res.render('index', {
                        user,
                        selectedDays,
                        weekdays
                    });
                } else {
                    if (shifts.length < 3) {
                        req.flash('Less', 'You must have select 3 working days')
                        let selectedDays = await service.selectShiftsUser(userData[0].id);
                        let weekdays = await service.keepCheck(userData);
                        res.render('index', {
                            user,
                            selectedDays,
                            weekdays
                        });
                    } else {
                        req.flash('success', 'Successfully added the shifts');
                        let lastShifts = await service.selectShiftsUser(userData[0].id);
                        if (lastShifts.length != 0) {
                            await service.deleteUserDays(userData[0].id);
                            await service.addShifts(user, shifts);
                        } else {
                            await service.addShifts(user, shifts);
                        }
                        let selectedDays = await service.selectShiftsUser(userData[0].id);
                        let weekdays = await service.keepCheck(userData);
                        res.render('index', {
                            user,
                            selectedDays,
                            weekdays
                        });
                    }
                }


            } else {
                res.render('notEmployed', {
                    user
                });
            }
        } catch (err) {
            res.send(err.stack)
        }
    }
    async function show(req, res) {
        try {

            await service.filterColors();
            let colouring = await service.getDays();
            res.render('days', {
                colouring
            })
        } catch (err) {
            res.send(err.stack);
        }
    }
    async function addWaiter(req, res) {
        try {
            let name = req.body.waiter;
            let code = req.body.passcode;
            if (name === '') {
                req.flash('info', 'Please inter both name and password')
            } else {
                let userData = await service.selectWaiter(name);
                if (userData.length != 0) {
                    req.flash('info', 'Cannot add the same user two times or more')
                } else {
                    await service.insertWaiter(name, code);
                    req.flash('added', 'Successfully added the new waiter')
                }
            }

            res.redirect('days')
        } catch (err) {
            res.send(err.stack);
        }
    }
    async function removeShifts(req, res) {
        try {
            await service.resetShifts();
            req.flash('delete', 'Removed all the shifts')
            res.redirect('days')
        } catch (err) {
            res.send(err.stack);
        }
    }
    return {
        home,
        checkingDays,
        show,
        addWaiter,
        removeShifts
    }
}