define( 
    'deepDependency/level23', 
    [ 
        'deepDependency/level31'
    ], 
    function ( level31 ) {
        return {
            name: 'deepDependency/level23',
            check: function () {
                var valid = 
                    level31.name == 'deepDependency/level31';
                    
                return valid;
            }
        };
    }
);