define( 
    'deepDependency/level22', 
    [ 
        'deepDependency/level3'
    ], 
    function ( level3 ) {
        return {
            name: 'deepDependency/level22',
            check: function () {
                var valid = 
                    level3.name == 'deepDependency/level3'
                    && level3.check();
                    
                return valid;
            }
        };
    }
);