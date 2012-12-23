define( 
    'circleDependency/d',
    [ 'circleDependency/e' ],
    function ( e ) {
        return {
            name: 'circleDependency/d',
            check: function () {
                return e.name == 'circleDependency/e' && e.check();
            }
        };
    }
);