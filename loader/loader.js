/**
 * @file js loader run in browser
 *       module define conforming amd spec
 * @author errorrik(errorrik@gmail.com)
 */



var define;
var require;

(function () {
    var modulesCache = {};
    var modulesAdder = [];
    var modules = {
        add: function ( id, module ) {
            modulesCache[ id ] = module;
            var arg = {
                id     : id,
                module : module
            };

            for ( var i = 0, len = modulesAdder.length; i < len; i++ ) {
                modulesAdder[ i ]( arg );
            }
        },

        exists: function ( id ) {
            return id in modulesCache;
        },

        get: function ( id ) {
            return modulesCache[ id ];
        },

        addAddListener: function ( listener ) {
            modulesAdder.push( listener );
        },

        removeAddListener: function ( listener ) {
            var len = modulesAdder.length;
            while ( len-- ) {
                if ( modulesAdder[ len ] == listener ) {
                    modulesAdder.splice( len, 1 );
                }
            }
        }
    };

    

    function define() {
        var id;
        var dependencies;
        var factory;

        var args = Array.prototype.slice.call( arguments );


        while ( args.length > 0 ) {
            var arg = args.shift();
            var type = typeof arg;

            switch ( type ) {
                case 'string':
                    id = arg;
                    break;
                case 'function':
                    factory = arg;
                    break;
                default:
                    if ( arg instanceof Array ) {
                        dependencies = arg;
                    }
                    break;
            }
        }

        if ( modules.exists( id ) ) {
            throw {
                message: id + ' is exist!'
            };
        }

        if ( dependencies ) {
            require( dependencies, initModule );
        }
        else {
            initModule();
        }

        function initModule() {
            var depends = dependencies || [];
            var len  = depends.length;
            var args = [];

            while ( len-- ) {
                args[ len ] = modules.get( depends[ len ] );
            }

            var module = factory.apply( this, args );
            modules.add( id, module );
        }
    }

    function require( moduleId, callback ) {
        var ids;
        if ( typeof moduleId == 'string' ) {
            ids = [ moduleId ];
        }
        else if ( moduleId instanceof Array ) {
            ids = moduleId.slice( 0 );
        }
        
        var idLen = ids.length;
        var moduleLoaded = new Array( idLen );
        for ( var i = 0; i < idLen; i++ ) {
            var id = ids[ i ];
            if ( modules.exists( id ) ) {
                moduleLoaded[ i ] = 1;
            }
            else {
                moduleLoaded[ i ] = 0;
                modules.addAddListener( getModuleAddListener( id, i ) );
                loadModule( id );
            }
        }

        return modules.get( ids[ 0 ] );

        function getModuleAddListener( id, index ) {
            var listener = function ( arg ) { 
                if ( arg.id != id ) {
                    return;
                }

                moduleLoaded[ index ] = 1;
                finishRequire();
                setTimeout( 
                    function () {
                        modules.removeAddListener( listener );
                    },
                    1
                );
            };

            return listener;
        }

        function finishRequire() {
            var allModuleReady = 1;
            for ( var i = 0; i < idLen; i++ ) {
                allModuleReady = allModuleReady && moduleLoaded[ i ];
            }

            if ( allModuleReady && typeof callback == 'function' ) {
                var callbackArgs = [];
                for ( var i = 0; i < idLen; i++ ) {
                    callbackArgs.push( modules.get( ids[ i ] ) );
                }

                callback.apply( this, callbackArgs );
            }
        }
    }

    var CONF = { 
        baseURL: '/' 
    };

    require.config = function ( conf ) {
        for ( var key in conf ) {
            CONF[ key ] = conf[ key ];
        }
    };

    window.define = define;
    window.require = require;


    var loadingModules = {};
    function loadModule( moduleId ) {
        if ( modules.exists( moduleId ) 
             || loadingModules[ moduleId ]
        ) {
            return;
        }
        
        loadingModules[ moduleId ] = 1;
        var script = document.createElement( 'script' );
        script.src = getURL( moduleId );
        script.onload = script.onreadystatechange = function () {
            var readyState = script.readyState;
            if ('undefined' == typeof readyState
                || readyState == "loaded"
                || readyState == "complete"
            ) {
                delete loadingModules[ moduleId ];
                script.onload = script.onreadystatechange = null;
            }
        }

        appendScript( script );
    }


    function appendScript( script ) {
        var doc = document;
        var firstScript = doc.getElementsByTagName( 'script' )[ 0 ];

        if ( firstScript ) {
            firstScript.parentNode.insertBefore( script, firstScript );
        }
        else {
            var parent = doc.getElementsByTagName( 'head' ) [ 0 ] || doc.body;
            parent.appendChild( script );
        }
    }

    function getURL( id ) {
        return CONF.baseURL + id + '.js';
    }
})();

