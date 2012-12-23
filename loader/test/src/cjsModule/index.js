define( 
    'cjsModule/index', 
    [ 'require', 'exports', 'module' ], 
    function ( require, exports, module ) {
        var cat = require( 'cjsModule/cat' );
        exports.name = 'cjsModule/index';
        exports.check = function () {
            return cat.name == 'cjsModule/cat';
        };
    }
);