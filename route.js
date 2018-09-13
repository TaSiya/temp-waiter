module.exports = function (service) {
    async function home (req, res) {
        try{
            let user = req.params.username;

            let userData = await service.selectWaiter(user);
            let checkBoxes = await service.getDays();
            let selectedDays = await service.selectShiftsUser(userData[0].id);
            if(userData.length != 0){
                
                res.render('index',{user, checkBoxes, selectedDays})
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
            let checkBoxes = await service.getDays();
            if(userData.length != 0){
                if(shifts === undefined){
                    req.flash('noShifts', 'Please select shifts before submitting');
                    res.render('index',{user, checkBoxes});
                }
                else if (shifts.length < 3){
                    req.flash('Less', 'You must have select 3 working days')
                    res.render('index',{user, checkBoxes});
                }
                else{
                    req.flash('success', 'Successfully added the shifts');
                    await service.addShifts(user,shifts);
                    res.render('index',{user, checkBoxes});
                }
                
            }
            else {
                res.render('notEmployed', {user});
            }
        } catch(err) {
            res.send(err.stack)
        }
    }
    return {
        home,
        checkingDays
    }
}