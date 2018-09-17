module.exports = function (service) {
    async function home (req, res) {
        try{
            let user = req.params.username;
            let userData = await service.selectWaiter(user);
            if(userData.length != 0){
                let selectedDays = await service.selectShiftsUser(userData[0].id);
                res.render('index',{user, selectedDays})
            }
            else {
                res.render('notEmployed', {user});
            }
        }
        catch(err){
            res.send(err.stack);
        }
    }
    async function checkingDays(req, res) {
        try{    
            let user = req.params.username;
            let shifts = req.body.weekdays;
            console.log(shifts);
            let userData = await service.selectWaiter(user);
            let check = Array.isArray(shifts);
            if(userData.length != 0){
                if (!check){
                    req.flash('noShifts', 'Not enough shifts');
                    let selectedDays = await service.selectShiftsUser(userData[0].id);
                    res.render('index',{user,selectedDays});
                }
                else{
                    if (shifts.length < 3){
                        req.flash('Less', 'You must have select 3 working days')
                        let selectedDays = await service.selectShiftsUser(userData[0].id);
                        res.render('index',{user,selectedDays});
                    }
                    else{
                        req.flash('success', 'Successfully added the shifts');
                        let lastShifts = await service.selectShiftsUser(userData[0].id);
                        if(lastShifts.length != 0){
                            await service.deleteUserDays(userData[0].id);
                            await service.addShifts(user,shifts);
                        }
                        else{
                            await service.addShifts(user,shifts);
                        }
                        let selectedDays = await service.selectShiftsUser(userData[0].id);
                        // console.log(checkBoxes);
                        res.render('index',{user,selectedDays});
                    }
                }
                
                
            }
            else {
                res.render('notEmployed', {user});
            }
        } catch(err) {
            res.send(err.stack)
        }
    }
    async function show (req, res) {
        try{
            
            await service.filterColors();
            let colouring = await service.getDays();
            res.render('days',{colouring})
        }
        catch(err) {
            res.send(err.stack);
        }
    }
    return {
        home,
        checkingDays,
        show
    }
}