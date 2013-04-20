(function(window, document, $, undefined) {

    var fbbtn = '<fb:login-button autologoutlink="true" perms="email,user_birthday,status_update,publish_stream"></fb:login-button>';
    $('.fb-button').append(fbbtn);

    window.fbAsyncInit = function() {
        FB.init({
            appId: '118773068319648', 
            status: true, 
            cookie: true, 
            xfbml: true
        });

        /* All the events registered */
        FB.Event.subscribe('auth.login', function(response) {
            login();
        });

        FB.Event.subscribe('auth.logout', function(response) {
            logout();
        });

        FB.getLoginStatus(function(response) {
            console.log(response);
            makePost('');

            if (response.session && response.status === 'connected') {
                login();
            } else {
                $('.fb-button').show();
            }
        });
    };

    (function() {
        var e = document.createElement('script');
        e.type = 'text/javascript';
        e.src = document.location.protocol +
            '//connect.facebook.net/en_US/all.js';
        e.async = true;
        document.getElementById('fb-root').appendChild(e);
    }());

    function login() {
        FB.api('/me', function(response) {

            if(!response.error) {
                $('#login').show();
                $('#login').html(response.name + " succsessfully logged in!");
                $('.fb-button').hide();
                makePost('');
            }
        });
    }
    function logout() {
        document.getElementById('login').style.display = "none";
    }

    var firstAuth = true;
    function makePost(msg) {
        console.log(1);
        /*
            message, picture, link, name, caption, 
            description, source, place, tags        
        */

        if(!firstAuth) {
            return;
        }

        var theFeed = {
            message: msg,
            caption: 'Uma cerveja ma-ra-vi-lho-sa!',
            name: 'Itaipava',
            description: 'Participe da parada da Itaipava, com a sua gravata e tals!',
            picture: 'http://files.softicons.com/download/system-icons/handy-icons-by-double-j-design/png/200x200/handy-icon_15.png'
        };

        FB.api('/me/feed', 'post', theFeed, function(response) {
            if (!response || response.error) {
                //alert('Error occured');
            } else {
                //alert('Post ID: ' + response.id);
            }
        });
    }

    function fqlQuery(){
        FB.api('/me', function(response) {
             var query = FB.Data.query('select name, hometown_location, sex, pic_square from user where uid={0}', response.id);
             query.wait(function(rows) {

               document.getElementById('name').innerHTML =
                 'Your name: ' + rows[0].name + "<br />" +
                 '<img src="' + rows[0].pic_square + '" alt="" />' + "<br />";
             });
        });
    }

    window.fbapp = {
        makePost: makePost
    };

})(window, document, jQuery);
