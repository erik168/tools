define( 
    'deepDependency/level3', 
    [ 
        'deepDependency/level4'
    ], 
    function ( level4 ) {
        return {
            name: 'deepDependency/level3',
            check: function () {
                var valid = 
                    level4.name == 'deepDependency/level4'
                    && level4.check();
                    
                return valid;
            }
        };
    }
);