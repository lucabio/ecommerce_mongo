

exports.getLogin = (req, res, next) => {
    console.log(req.get('Cookie'));
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        editing:false,
        isAuthenticated : req.isLoggedIn
    })
};

exports.postLogin = (req, res, next) => {
    //req.isLoggedIn = true;
    res.setHeader('Set-Cookie','loggedIn=true');
    res.redirect('/')
};