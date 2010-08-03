var profile = (function() {
    var run = 0;
    return function(name, fn) {
        setTimeout(function() {
            console.profile(name);
            fn();
            console.profileEnd();
        }, (++ run) * 1000);
    };
})();

var dataStack = [];

for (var i = 0; i < 1000; i ++) {
    dataStack.push({ id: i, name: "user" + i, age: (5 + Math.floor(Math.random() * 50)) });
}

profile("Empty query", function() {
    new Jql().from(dataStack).query();
});

profile("Select field from empty query", function() {
    new Jql().from(dataStack).select("name").query();
});

profile("Use built in condition", function() {
    new Jql().from(dataStack).where("id >= ?", 30).query();
});

profile("Use function as a condition", function() {
    new Jql().from(dataStack).where(function(item) {
        return item.id >= 30;
    }).query();
});

profile("Use limit with empty query", function() {
    new Jql().from(dataStack).limit(300).query();
});

profile("Use offset with empty query", function() {
    new Jql().from(dataStack).offset(300).query();
});

profile("Use order with empty query", function() {
    new Jql().from(dataStack).order('name', true).query();
});

profile("Something more complex", function() {
    new Jql().select('name').from(dataStack).where(function(item) {
        return item.name.match(/[1-5]$/);
    }).where('age >= ?', 21).order('name', true).limit(300).query();
});
