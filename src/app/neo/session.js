angular.module('neograph.session',['neograph.neo'])
    .factory('session', ['neo', '$q', function (neo, $q) {

    var anonUser = {
        Lookup: 'Anonymous',
        roles: { "Public": {}}
    }


    var session = {

        init: function () {

            neo.getUser("Julian").then(function (user) {

                session.user = user;
                session.signedIn = true;
            });

            return session;

        }
        ,
        signingIn: false
        ,
        signedIn: false
        ,
        user: anonUser
        ,
        signIn: function (username, password) {

            return neo.authenticate(username, password).then(function (user) {

                session.user = user;


                console.log(session.user)
             //   session.apps = service.getApps(session.user.roles);


                localStorage.username = session.user.username;


                session.signedIn = true;

                if (user.roles.PreReg) {
                    $('body').addClass('prereg');
                }
                else {
                    $('body').removeClass('prereg');
                }



            }, function (failMessage) {
                console.log(failMessage);
                return $q.reject(failMessage);
            });

        }
        ,
        signOut: function () {

            session.user = anonUser;
            localStorage.username = "";// = JSON.stringify(session.user);
            session.signedIn = false;
          //  session.apps = service.getApps(session.user.roles);

        }
    }



    if (localStorage.username) {
        session.user = neo.getUser(localStorage.username);
    }

    if (session.user.name != 'Anonymous') {
        session.signedIn = true;
    }

 //   session.apps = service.getApps(session.user.roles);

    return session.init();


}])