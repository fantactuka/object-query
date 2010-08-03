var entireData = [
    { name: 'Bob', id: 1, age: 20 },
    { name: 'Rob', id: 2, age: 42 },
    { name: 'Tim', id: 3, age: 21 },
    { name: 'Hap', id: 4, age: 54 },
    { name: 'Ted', id: 5, age: 43 },
    { name: 'Sam', id: 6, age: 20 },
    { name: 'Liz', id: 7, age: 21 }
];

describe('Jql queries', {
    'should return entire data if no selection params applied': function() {
        value_of(new Jql().from(entireData).q()).should_be(entireData);
        value_of(new Jql(entireData).q()).should_be(entireData);
    },

    'should support `q` as alias for `query`': function() {
        value_of(new Jql().from(entireData).q()).should_be(new Jql().from(entireData).query());
    },

    'should select listed fields in select method': function() {
        value_of(new Jql().from(entireData).select('name').q()).should_be(['Bob', 'Rob', 'Tim', 'Hap', 'Ted', 'Sam', 'Liz']);
    },

    'should select according string where condition': function() {
        value_of(new Jql().from(entireData).where('age > ?', 25).q()).should_be([
            { name: 'Rob', id: 2, age: 42 },
            { name: 'Hap', id: 4, age: 54 },
            { name: 'Ted', id: 5, age: 43 }
        ]);
    },

    'should select according filter where condition': function() {
        value_of(new Jql().from(entireData).where(function(item) {
            return item.id * 2 < 10;
        }).q()).should_be([
            { name: 'Bob', id: 1, age: 20 },
            { name: 'Rob', id: 2, age: 42 },
            { name: 'Tim', id: 3, age: 21 },
            { name: 'Hap', id: 4, age: 54 }
        ]);
    },

    'should limit response': function() {
        value_of(new Jql().from(entireData).limit(3).q()).should_be([
            { name: 'Bob', id: 1, age: 20 },
            { name: 'Rob', id: 2, age: 42 },
            { name: 'Tim', id: 3, age: 21 }
        ]);
    },

    'should have offset': function() {
        value_of(new Jql().from(entireData).offset(2).q()).should_be([
            { name: 'Tim', id: 3, age: 21 },
            { name: 'Hap', id: 4, age: 54 },
            { name: 'Ted', id: 5, age: 43 },
            { name: 'Sam', id: 6, age: 20 },
            { name: 'Liz', id: 7, age: 21 }
        ]);
    },

    'should be ordered': function() {
        value_of(new Jql().from(entireData).where('age > ?', 25).order('age').q()).should_be([
            { name: 'Rob', id: 2, age: 42 },
            { name: 'Ted', id: 5, age: 43 },
            { name: 'Hap', id: 4, age: 54 }
        ]);
    },

    'should be ordered by function': function() {
        value_of(new Jql().from(entireData).where('age > ?', 25).order(function(a, b) {
            return (a.name >= b.name) ? 1 : -1;
        }).q()).should_be([
            { name: 'Hap', id: 4, age: 54 },
            { name: 'Rob', id: 2, age: 42 },
            { name: 'Ted', id: 5, age: 43 }
        ]);
    },

    'should do this one also': function() {
        var jql = new Jql().select('name').from(entireData).where(function(item) {
            return item.name.match(/[bp]$/) && item.age >= 25;
        }).order('name', true);
        value_of(jql.q()).should_be(['Rob', 'Hap']);
    }
});

describe('Jql scope', {
    'should create new scope for query': function() {
        var jql = new Jql().from(entireData);
        var jql2 = jql.scope();

        value_of(jql.select('name').order('age', true).limit(2).q()).should_be(['Hap', 'Ted']);
        value_of(jql2.select('name').order('name').q()).should_be(['Bob', 'Hap', 'Liz', 'Rob', 'Sam', 'Ted', 'Tim']);
    }
});


var nameExpectations = {
    '*=': {
        expected: ['Bob', 'Rob'],
        value: 'o'
    },
    '^=': {
        expected: ['Tim', 'Ted'],
        value: 'T'
    },
    '$=': {
        expected: ['Tim', 'Sam'],
        value: 'T'
    },
    '=': {
        expected: ['Bob'],
        value: 'Bob'
    },
    '!=': {
        expected: ['Rob', 'Tim', 'Hap', 'Ted', 'Sam', 'Liz'],
        value: 'Bob'
    }
};

var ageExpectations = {
    'within': {
        expected: [20, 21, 43, 20, 21],
        value: [20, 21, 22, 43]
    },
    'between': {
        expected: [20, 42, 21, 20, 21],
        value: [20, 42]
    },
    '>': {
        expected: [42, 54, 43],
        value: 25
    },
    '>=': {
        expected: [42, 54, 43],
        value: 42
    },
    '<': {
        expected: [20, 20],
        value: 21
    },
    '<=': {
        expected: [20, 21, 20, 21],
        value: 21
    }
};

var expectationsSpecs = {};
var generateExpextationsSpec = function(expectations, field) {
    for(var condition in expectations) {
        if(expectations.hasOwnProperty(condition)) {
            expectationsSpecs[condition] = function() {
                value_of(new Jql().from(entireData)
                        .select(field)
                        .where(field + ' ' + condition + ' ?', expectations[condition].value).q())
                        .should_be(expectations[condition].expected);
            };
        }
    }
};

generateExpextationsSpec(nameExpectations, 'name');
generateExpextationsSpec(ageExpectations, 'age');

describe('Jql conditions', expectationsSpecs);
