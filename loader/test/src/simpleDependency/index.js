define( 
    'simpleDependency/index', 
    [ 'simpleDependency/cat' ], 
    function ( cat ) {
        return {
            name: 'simpleDependency/index',
            check: function () {
                return cat.name == 'simpleDependency/cat'
            }
        };
    }
);