define( 
    'circleDependency/c',
    [ 'circleDependency/a' ],
    function ( a ) {
        return {
            name: 'circleDependency/c',
            check: function () {
                var a = require( 'circleDependency/a' );
                return a.name == 'circleDependency/a';
            }
        };
    }
);