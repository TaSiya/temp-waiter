module.exports = function (service) {
    async function home (req, res) {
        res.render('index')
    }

    return {
        home
    }
}