define( 
    'manyDependency/index', 
    [ 
        'manyDependency/cat', 
        'manyDependency/dog',
        'manyDependency/tiger',
        'manyDependency/lion',
    ], 
    function ( cat, dog, tiger ) {
        var lion = require( 'manyDependency/lion' );

        return {
            name: 'manyDependency/index',
            check: function () {
                var valid = 
                    cat.name == 'manyDependency/cat'
                    && dog.name == 'manyDependency/dog'
                    && tiger.name == 'manyDependency/tiger'
                    && lion.name == 'manyDependency/lion';
                return valid;
            }
        };
    }
);