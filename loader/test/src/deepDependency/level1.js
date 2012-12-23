define( 
    'deepDependency/level1', 
    [ 
        'deepDependency/level2', 
        'deepDependency/level21'
    ], 
    function ( level2, level21 ) {
        return {
            name: 'deepDependency/level1',
            check: function () {
                var valid = 
                    level2.name == 'deepDependency/level2'
                    && level21.name == 'deepDependency/level21';
                    
                return valid;
            }
        };
    }
);