/**
 * @file js loader run in browser
 *       module define conforming amd spec
 * @author errorrik(errorrik@gmail.com)
 */

// TODO: support require relative module path
// TODO: support object 4 define


var define;
var require;

(function () {
    /**
     * 已定义模块容器
     * 
     * @inner
     * @type {Object}
     */
    var definedModule = {};

    /**
     * 定义中模块容器
     * 
     * @inner
     * @type {Object}
     */
    var definingModule = {};

    /**
     * 模块添加事件监听器
     * 
     * @inner
     * @type {Array}
     */
    var modulesAdder = [];
    
    /**
     * 模块管理
     * 
     * @inner
     */
    var modules = {
        /**
         * 添加模块
         * 
         * @param {string} id 模块标识
         * @param {Object} module 模块
         */
        add: function ( id, module ) {
            definedModule[ id ] = module;
            delete definingModule[ id ];
            var arg = {
                id     : id,
                module : module.exports
            };

            // fire add event
            for ( var i = 0, len = modulesAdder.length; i < len; i++ ) {
                modulesAdder[ i ]( arg );
            }
        },

        /**
         * 添加定义中模块
         * 
         * @param {string} id 模块标识
         * @param {Object} module 模块
         */
        addDefining: function ( id, module ) {
            definingModule[ id ] = module;
        },

        /**
         * 判断模块是否存在
         * 
         * @param {string} id 模块标识
         * @return {boolean}
         */
        exists: function ( id ) {
            return id in definedModule;
        },

        /**
         * 获取模块
         * 
         * @param {string} id 模块标识
         * @return {Object}
         */
        get: function ( id ) {
            return definedModule[ id ] && definedModule[ id ].exports;
        },

        /**
         * 获取定义中模块
         * 
         * @param {string} id 模块标识
         * @return {Object}
         */
        getDefining: function ( id ) {
            return definingModule[ id ] && definingModule[ id ];
        },

        /**
         * 添加“模块添加”事件监听器
         * 
         * @param {function(Object)} listener 监听器
         */
        addAddListener: function ( listener ) {
            modulesAdder.push( listener );
        },

        /**
         * 移除“模块添加”事件监听器
         * 
         * @param {function(Object)} listener 监听器
         */
        removeAddListener: function ( listener ) {
            var len = modulesAdder.length;
            while ( len-- ) {
                if ( modulesAdder[ len ] == listener ) {
                    modulesAdder.splice( len, 1 );
                }
            }
        }
    };

    /**
     * 定义模块
     * 
     * @param {string=} id 模块标识
     * @param {Array=} dependencies 依赖模块列表
     * @param {Function=} factory 创建模块的工厂方法
     */
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

        // process dependencies
        var module = { id: id, exports: {} };
        var INTERNAL_MODULE = {
            require: require,
            exports: module.exports,
            module: module
        };
        modules.addDefining( id, module );

        // init depends
        var depends = [];
        if ( dependencies ) {
            depends.push.apply( depends, dependencies );  
        }

        // find require where in factory body
        var matches;
        var factoryBody = factory ? factory.toString() : '';
        var requireRule = /require\(\s*(['"'])([^'"]+)\1\s*\)/g
        while ( ( matches = requireRule.exec( factoryBody ) ) ) {
            depends.push( matches[ 2 ] );
        }

        // exclude internal module & circle dependency
        var len = depends.length;
        while ( len-- ) {
            var dependName = depends[ len ];
            if ( dependName in INTERNAL_MODULE
                 || isInDependencyChain( id, dependName )
            ) {
                depends.splice( len, 1 );
            }
        }

        function isInDependencyChain( source, target ) {
            var module = modules.getDefining( target ) || modules.get( target );
            var depends = module && module.dependencies;

            if ( depends ) {
                var len = depends.length;

                while ( len-- ) {
                    var dependName = depends[ len ];
                    if ( source == dependName
                         || isInDependencyChain( source, dependName ) ) {
                        return true;
                    }
                }
            }
            return false;
        }

        // process dependencies
        module.dependencies = depends;
        if ( depends.length ) {
            require( depends, initModule );
        }
        else {
            initModule();
        }

        /**
         * 初始化模块，在所有依赖加载后初始化
         * 
         * @inner
         */
        function initModule() {
            var depends = dependencies || [];
            var len  = depends.length;
            var args = [];

            while ( len-- ) {
                var dependName = depends[ len ];
                args[ len ] = dependName in INTERNAL_MODULE
                    ? INTERNAL_MODULE[ dependName ]
                    : modules.get( depends[ len ] );
            }

            var exports = factory.apply( this, args );
            if ( typeof exports != 'undefined' ) {
                module.exports = exports;
            }
            modules.add( id, module );
        }
    }

    /**
     * 获取模块
     * 
     * @param {string|Array} moduleId 模块名称或模块名称列表
     * @param {Function=} callback 获取模块完成时的回调函数
     * @return {Object} 如果模块没ready需要下载，则返回null
     */
    function require( moduleId, callback ) {
        var ids;
        if ( typeof moduleId == 'string' ) {
            ids = [ moduleId ];
        }
        else if ( moduleId instanceof Array ) {
            ids = moduleId.slice( 0 );
        }

        if ( !ids ) {
            return null;
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

        finishRequire();
        return modules.get( ids[ 0 ] ) || null;

        /**
         * 获取模块添加完成的事件监听器
         * 
         * @inner
         * @param {string} id 模块标识
         * @param {number} index 模块在依赖数组中的索引
         * @return {Function}
         */
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

        /**
         * 完成require，调用callback
         * 在模块与其依赖模块都加载完时调用
         * 
         * @inner
         */
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

    window.define = define;
    window.require = require;

    /**
     * 正在加载的模块列表
     * 
     * @inner
     * @type {Object}
     */
    var loadingModules = {};

    /**
     * 加载模块
     * 
     * @inner
     * @param {string} moduleId 模块标识
     */
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
            if ( typeof readyState == 'undefined'
                 || readyState == "loaded"
                 || readyState == "complete"
            ) {
                delete loadingModules[ moduleId ];
                script.onload = script.onreadystatechange = null;
            }
        }

        appendScript( script );
    }

    /**
     * 向页面中插入script标签
     * 
     * @inner
     * @param {HTMLScriptElement} script script标签
     */
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

    // TODO: comform require spec[ https://github.com/amdjs/amdjs-api/wiki/require ]
    var CONF = { 
        baseURL: '/' 
    };

    require.config = function ( conf ) {
        for ( var key in conf ) {
            CONF[ key ] = conf[ key ];
        }
    };
    function getURL( id ) {
        return CONF.baseURL + id + '.js';
    }
})();

