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


var price = 3,
    mytag = '00000000';

settings = {};
settings = {
    price: '3',
    mytag: '0000000000',
    msg: ''
};

//Routes
app.get('/', function(req, res){
    res.render('home', {
        message: "Passa sua gravata!",
        mytag: '0000000000',
        alertType: 'info'
    });
});

app.get('/cadastro', function(req, res){
    res.render('cadastro');
});

app.get('/adicionar', function(req, res){
    res.render('adicionar');
});

app.get('/add', function(req, res){
    res.render('add');
});

// Telas do bar
app.get('/bar', function(req, res){
    res.render('home-bar');
})

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
    mytag = req.body.gravata;
    fbId = req.body.fbId;

    if (mytag) {

        var key = mytag + "_" + fbId;

        console.log("MyTAG is: " + mytag);
        console.log("KEY is: " + key);

        client.get(key, function(e, credit) {
            if (!credit) {
                console.log('Credito: ' + credit);

                client.incrbyfloat(key, 20, function(e, rst) {
                    console.log('Reais: ' + rst);
                    res.render('curtir', {});
                })
            } else {
                res.render('add', {
                    message: "Gravata já cadastrada!",
                    mytag: mytag,
                    alertType: 'error'
                });
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

app.post('/', function(req, res){
    console.log(req.body);
    mytag = req.body.gravata;

    if (mytag) {

        client.get(mytag, function(e, credit) {
            if (credit) {
                console.log('Credito: ' + credit);

                if (credit >= price) {
                    client.incrbyfloat(mytag, (price * -1), function(e, rst) {
                        console.log('Reais: ' + rst);
                        res.render('compra', {
                            message: "Boa compra!",
                            mytag: mytag,
                            credit: rst,
                            price: price,
                            alertType: 'success'
                        });
                    })
                } else {
                    res.render('home', {
                        message: "Gravata sem crédito!",
                        mytag: mytag,
                        alertType: 'warning'
                    });
                }

            } else {
                res.render('home', {
                    message: "Gravata não cadastrada!",
                    mytag: mytag,
                    alertType: 'error'
                });
            }
        })
    } else {
        res.render('home', {
            message: "Passa sua Gravata!",
            mytag: '0000000000',
            alertType: 'info'

        });

    }

});

app.post('/saveUser', function(req, res) {
    var userData = {
        name: req.body.userName || '',
        email: req.body.userEmail || ''
    },
        userId = req.body.userId;

    if(userId) {

        client.get(userId, function(e, data) {
            if (data) {
                //HERE GOES THE "WELCOME BACK USER" REDIRECT
                res.send({status: 'USER_IS_BACK'});
            } else {
                client.set(userId, JSON.stringify(userData), function(err, resp) {
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


app.listen(8080);