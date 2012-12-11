var define;
var require;

(function () {
    var modules = {};

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

        if ( modules[ id ] ) {
            throw {
                message: id + ' is exist!'
            };
        }

        var module = factory();
        modules[ id ] = module;
    }

    function require( id, callback ) {
        var module = modules[ id ];

        if ( typeof callback != 'function' ) {
            callback = new Function();
        }

        if ( module ) {
            callback( module );
            return module;
        }
        else {
            var script = document.createElement( 'script' );
            script.src = getURL( id );
            
            script.onload = script.onreadystatechange = function () {

                var readyState = script.readyState;
                if ('undefined' == typeof readyState
                    || readyState == "loaded"
                    || readyState == "complete"
                ) {
                    try {
                        callback( modules[ id ] );
                    } 
                    finally {
                        script.onload = script.onreadystatechange = null;
                    }
                }
            }
        }

        appendScript( script );
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

