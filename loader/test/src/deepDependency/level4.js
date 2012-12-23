define( 
    'deepDependency/level4', 
    [ 
        'deepDependency/level5'
    ], 
    function ( level5 ) {
        return {
            name: 'deepDependency/level4',
            check: function () {
                var valid = level5.name == 'deepDependency/level5';
                    
                return valid;
            }
        };
    }
);