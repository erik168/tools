define( 
    'circleDependency/cat',
    [ 'circleDependency/a', 'circleDependency/d' ],
    function ( a, d ) {
        return {
            name: 'circleDependency/cat',
            check: function () {
                return a.name == 'circleDependency/a' 
                        && d.name == 'circleDependency/d' 
                        && a.check() && d.check();
            }
        };
    }
);