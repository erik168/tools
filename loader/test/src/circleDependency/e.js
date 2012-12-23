define( 
    'circleDependency/e',
    [ 'circleDependency/d' ],
    function ( d ) {
        return {
            name: 'circleDependency/e',
            check: function () {
                var d = require( 'circleDependency/d' );
                return d.name == 'circleDependency/d';
            }
        };
    }
);