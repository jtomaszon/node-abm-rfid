(function(window, document, $, undefined) {

    var fbId;

    //binds de login e logout
    $(document).on('click', '.frmSubmit', function() {
        $('#frmAddCredit').submit();
    });
    
    $(document).on('click', '.logMenu', function() {
        FB.login();
    });
    
    $(document).on('click', '.logMenuOUT', function() {
        FB.logout(function() {
            location.href = '/';
        });
    });

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
                    $('#fbId').val(data.id);
                    saveUser(data);
                });
            }
        });

        /* All the events registered */
        FB.Event.subscribe('auth.login', function(response) {
            login();
        });

        FB.Event.subscribe('auth.logout', function(response) {
            logout();
        });

        FB.getLoginStatus(function(response) {

            if(response.status == 'connected') {

                FB.api('me', function(data) {
                    fbId = data.id;

                    //pega o credito e full key
                    $.ajax({
                        url: '/getCredit?fbId=' + data.id,
                        type: 'GET',
                        success: function(result) {
                            $('.txtValor').html(result.valor);
                            $('#fullKey').val(result.fullKey);
                        }
                    });

                });

                $('.txtValor').html('');

                $('.logMenu').hide();
                $('.logMenuOUT').show();
            } else {
                $('.logMenu').show();
                $('.logMenuOUT').hide();
            }

            if(response.status !== 'connected' && response.status !== 'not_authorized') {
                //console.log('nem conectado esta', response);
                $('.fb-button').show();
            } else {
                if(response.status === 'not_authorized') {
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

                $('.logMenu').hide();
                $('.logMenuOUT').show();

            } else {
                //console.log('caiu no else do login', response)
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
            name: 'Itaipava | Gravata 100%',
            caption: 'Perfect Tie',
            description: 'Acabei de cadastrar minha Gravata 100% da Cerveja Itaipava. Agora meu happy hour tá garantido!',
            picture: 'https://itaipava.tolabs.us/img/facebook/post-share.jpg',
	        link: 'http://www.cervejaitaipava.com.br/'
        };

        FB.api('/me/feed', 'post', theFeed, function(response) {
            if (!response || response.error) {
                console.log('Error occured', response.error);
            } else {
                //console.log('Post ID: ' + response.id);
            }
        });

        // var imgURL="https://itaipava.tolabs.us/img/logo2face.png";
        // FB.api('/album_id/photos', 'post', {
        //     message:'Participe da parada da Itaipava, com a sua gravata e tals!',
        //     url:imgURL        
        // }, function(response){

        //     if (!response || response.error) {
        //         console.log('Error occured', response.error);
        //     } else {
        //         console.log('Post ID: ' + response.id);
        //     }

        // });

    }

    window.fbapp = {
    };

})(window, document, jQuery);

