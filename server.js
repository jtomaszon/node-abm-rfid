var express = require("express"),
    app = express();

var redis = require("redis"),
    client = redis.createClient();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});


var price = 7,
    mytag = '00000000';

//Routes
app.get('/', function(req, res){
    res.render('home');
});

// Legacy
app.get('/privacy', function(req, res){
    res.end('Privacy');
});

app.get('/terms', function(req, res){
    res.end('Terms');
});



app.get('/update', function(req, res){
    res.render('update', {
        message: "Passa sua gravata!",
        mytag: '0000000000',
        alertType: 'info'
    });
});


app.post('/add', function(req, res){
    console.log(req.body);
    mytag = req.body.mytag;
    fbId = req.body.fbId;

    if (mytag) {
        var key = mytag + "_" + fbId;

        console.log("MyTAG is: " + mytag);
        console.log("KEY is: " + key);

        client.get(key, function(e, credit) {
            if (!credit) {
                client.incrbyfloat(key, 20, function(e, rst) {
                    console.log('Reais: ' + rst);
                    res.send({
                        status: 'TIE_SAVED',
                        credit: rst
                    });
                })
            } else {
                res.send({status: 'TIE_DUPLICATED'});
            }
        })
    }
});

app.post('/update', function(req, res){
    console.log(req.body);
    mytag = req.body.gravata;
    amount = req.body.amount;

    if (mytag) {

        client.get(mytag, function(e, credit) {
            if (credit) {
                console.log('Credito: ' + credit);

                client.incrbyfloat(mytag, amount, function(e, rst) {
                    console.log('Reais: ' + rst);
                    res.render('update', {
                        message: "Crédito adicionado!",
                        mytag: mytag,
                        credit: rst,
                        price: price,
                        alertType: 'success'
                    });
                })
            }
        })
    }
});

app.post('/saveUser', function(req, res) {
    var userData = {
        name: req.body.userName || '',
        email: req.body.userEmail || ''
    },
        fbId = req.body.userId;

    if(fbId) {

        client.get(fbId, function(e, data) {
            if (data) {
                //HERE GOES THE "WELCOME BACK USER" REDIRECT
                client.keys('*_' + fbId, function(err, keys) {
                    if(err) {
                        console.log('erro', err);
                        res.send({error: true, status: err});
                        return;
                    } else {
                        if(keys.length) {
                            client.get(keys[0], function(err2, data) {
                                res.send({
                                    status: 'USER_IS_BACK', 
                                    credit: data, 
                                    fullKey: keys[0]
                                });
                            });
                        } else {
                            res.send({error: true, status: 'no id found'});
                            return;
                        }
                    }
                });
            } else {
                client.set(fbId, JSON.stringify(userData), function(err, resp) {
                    if(err) {
                        console.log('erro', err);
                    } else {
                        //HERE GOES THE "USER HAS BEEN ADDED" REDIRECT
                        res.send({status: 'USER_ADDED'});
                    }
                });
            }
        });
    }
});


app.get('/getCredit', function(req, res) {
    var fbId = req.query.fbId;

    if(!fbId) {
        res.send({error: true, status: 'no facebook id'});
        return;
    }

    client.keys('*_' + fbId, function(err, keys) {
        if(err) {
            console.log('erro', err);
            res.send({error: true, status: err});
            return;
        } else {
            if(keys.length) {
                client.get(keys[0], function(err2, data) {
                    res.send({
                        status: 'OK', 
                        valor: data, 
                        fullKey: keys[0]
                    });
                });
            } else {
                res.send({error: true, status: 'no id found'});
                return;
            }
        }
    });
});

app.post('/thanks', function(req, res){
    mytag = req.body.gravata;

    client.keys(mytag + '_*', function(e, fullKey){
        if (fullKey.length) {
            console.log('KEY: ' + fullKey);
            fbId = fullKey.toString().split("_")
            client.get(fbId[1], function(e, data){
                console.log(data);

                fbData = JSON.parse(data);

                client.get(fullKey, function(err, credit){

                    if (credit >= price) {
                        client.incrbyfloat(fullKey, (price * -1), function(e, rst) {
                            console.log('Reais: ' + rst);
                            res.render('thanks-bar', {
                                fbName: fbData.name,
                                credit: rst
                            });             
                        })
                    } else {
                        res.render('saldoNegativo', {
                            credit: credit
                        });
                    }
                })
            })
        }else{
            res.end("Foo")
        }
    })

})


app.post('/addCredit', function(req, res) {
    var key = req.body.fullKey,
        valor = req.body.price;
    console.log('dados', key, valor);

    client.incrbyfloat(key, valor, function(err, rst) {

        if(err) {
            console.log(err);
            res.send({error:true, status: err});
            return;
        }

        res.send({status: 'OK!'});

    })

});



////////////// NEW VERSION
// Telas do usuario
app.get('/site', function(req, res){
    res.render('home-usr', {
        section: ""
    })
})

app.get('/site/connect', function(req, res){
    res.render('home-usr', {
        section: 0
    })
})

app.get('/site/cadastro', function(req, res){
    res.render('home-usr', {
        section: 1
    })
})

app.get('/site/balance', function(req, res){
    res.render('home-usr', {
        section: 2
    })
})
// Telas do bar
app.get('/bar', function(req, res) {
    res.render('home-bar', {
        section:  ""
    });
})



app.post('/bar', function(req, res){
    mytag = req.body.gravata;

    client.keys(mytag + '_*', function(e, fullKey){
        if (fullKey.length) {
            console.log('KEY: ' + fullKey);
            fbId = fullKey.toString().split("_")
            client.get(fbId[1], function(e, data){
                console.log(data);

                fbData = JSON.parse(data);

                client.get(fullKey, function(err, credit){

                    if (credit >= price) {
                        client.incrbyfloat(fullKey, (price * -1), function(e, rst) {
                            console.log('Reais: ' + rst);
                            res.render('home-bar', {
                                price: price,
                                credit: rst,
                                section: 1
                            });             
                        })
                    } else {
                        res.render('home-bar', {
                            credit: credit,
                            section: 0
                        });
                    }
                })
            })
        }else{
            res.render('home-bar', {
                section: 2
            })
        }
    })

})


app.post('/site/new', function(req, res){

})


app.listen(8080);
