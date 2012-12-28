define( 
    'deepDependency/level3', 
    [ 
        'deepDependency/level4'
    ], 
    {
        name: 'deepDependency/level3',
        check: function () {
            var level4 = require( 'deepDependency/level4' );
            var valid = 
                level4.name == 'deepDependency/level4'
                && level4.check();
                
            return valid;
        }
    }
);