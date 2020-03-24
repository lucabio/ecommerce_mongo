exports.pageNotFound = (req, res, next) => {
    //res.status(404).send('<h1>Page Not Found</h1>');
    //res.status(404).sendFile(path.join(__dirname,'views','404.html'));
    res.status(404).render('404',{pageTitle : 'Page Not Found',path : '',isAuthenticated : req.session.isLoggedIn});
}

exports.get500 = (req, res, next) => {
    //res.status(404).send('<h1>Page Not Found</h1>');
    //res.status(404).sendFile(path.join(__dirname,'views','404.html'));
    let message = req.flash('error');
    console.log(message);
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    
    res.status(500).render('500',{pageTitle : 'Error Occured',path : '',isAuthenticated : req.session.isLoggedIn,error:message.errmsg});
}