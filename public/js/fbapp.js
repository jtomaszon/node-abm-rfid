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

        FB.Event.subscribe('auth.statusChange', function(response) {
            if(response.status === 'connected') {
                FB.api('/me', function(data) {
                    saveUser(data);
                });
            }
        });

        FB.getLoginStatus(function(d){ 
            if(d.status === 'connected') {
                FB.api('/me', function(response) {
                    saveUser(response);
                });
            }
        });

        /* All the events registered */
        FB.Event.subscribe('auth.login', function(response) {
            console.log('login event chamado');
            login();
        });

        FB.Event.subscribe('auth.logout', function(response) {
            logout();
        });

        FB.getLoginStatus(function(response) {
            console.log('response', response);

            if(response.status !== 'connected' && response.status !== 'not_authorized') {
                console.log('nem conectado esta', response);
                $('.fb-button').show();
            } else {
                if(response.status === 'not_authorized') {
                    console.log('not_authorized', response);
                    $('.fb-button').show();
                }
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

    function saveUser(resp) {
        console.log('saving');
        $.ajax({
            url: '/saveUser', 
            data: {
                userId: resp.id, 
                userName: resp.name,
                userEmail: resp.email
            }, 
            type: 'POST',
            success: function(data) {
                //makePost(data.status);
                //se usuario ja estava cadastrado nao faz post
                if(!data.status || data.status !== 'USER_IS_BACK') {
                    makePost('');
                }
            }
        });
    }

    function login() {
        FB.api('/me', function(response) {

            if(!response.error) {
                saveUser(response);
                $('.logMenu').html("logout");
            } else {
                console.log('caiu no else do login', response)
            }
        });
    }
    function logout() {
        $('.logMenu').html("login");
    }

    function makePost(msg) {
        /*
            message, picture, link, name, caption, 
            description, source, place, tags        
        */

        var theFeed = {
            message: msg,
            caption: 'Uma cerveja ma-ra-vi-lho-sa!',
            name: 'Itaipava | Perfect Tie',
            description: 'Participe da parada da Itaipava, com a sua gravata e tals!',
            picture: 'https://itaipava.tolabs.us/img/logo2face.png',
	       link: 'http://www.cervejaitaipava.com.br/'
        };

        FB.api('/me/feed', 'post', theFeed, function(response) {
            if (!response || response.error) {
                console.log('Error occured');
            } else {
                console.log('Post ID: ' + response.id);
            }
        });
    }

    window.fbapp = {
    };

})(window, document, jQuery);

