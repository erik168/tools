define( 
    'deepDependency/level11', 
    [ 
        'deepDependency/level22', 
        'deepDependency/level23'
    ], 
    function ( level22, level23 ) {
        return {
            name: 'deepDependency/level11',
            check: function () {
                var valid = 
                    level22.name == 'deepDependency/level22'
                    && level23.name == 'deepDependency/level23'
                    && level22.check()
                    && level23.check();
                    
                return valid;
            }
        };
    }
);