define( 
    'circleDependency/a',
    [ 'circleDependency/b' ],
    function ( b ) {
        return {
            name: 'circleDependency/a',
            check: function () {
                return b.name == 'circleDependency/b' && b.check();
            }
        };
    }
);