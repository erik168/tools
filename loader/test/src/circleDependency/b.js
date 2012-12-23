define( 
    'circleDependency/b',
    [ 'circleDependency/a', 'circleDependency/c' ],
    function ( a, c ) {
        return {
            name: 'circleDependency/b',
            check: function () {
                var a = require( 'circleDependency/a' );
                return a.name == 'circleDependency/a' 
                        && c.name == 'circleDependency/c' && c.check();
            }
        };
    }
);