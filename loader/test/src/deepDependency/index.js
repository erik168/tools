define( 
    'deepDependency/index', 
    [ 
        'deepDependency/level1', 
        'deepDependency/level11'
    ], 
    function ( level1, level11 ) {
        return {
            name: 'deepDependency/index',
            check: function () {
                var valid = 
                    level1.name == 'deepDependency/level1'
                    && level11.name == 'deepDependency/level11'
                    && level1.check()
                    && level11.check();
                return valid;
            }
        };
    }
);