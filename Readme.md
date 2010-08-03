JavaScript Object Query
===========

DSL for JavaScript arrays of objects querying

Usage examples
----------

**Initial data that will  be queried**

  var entireData = [
      { name: 'Bob', id: 1, age: 20 },
      { name: 'Rob', id: 2, age: 42 },
      { name: 'Tim', id: 3, age: 21 },
      { name: 'Hap', id: 4, age: 54 },
      { name: 'Ted', id: 5, age: 43 },
      { name: 'Sam', id: 6, age: 20 },
      { name: 'Liz', id: 7, age: 21 }
  ];


**from()**
  `new Jql().from(entireData).where('age >= ?', 25).query()` or `new Jql(entireData).where('age >= ?', 25).query()`
  [
    { name: 'Rob', id: 2, age: 42 },
    { name: 'Hap', id: 4, age: 54 },
    { name: 'Ted', id: 5, age: 43 }
  ]


**where()**
  new Jql(entireData).where('age >= ?', 25).order('age').query() or as a function
  new Jql(entireData).where(function(dataItem) {
    return dataItem.age >= 25;
  }).order('age').query()

  [
    { name: 'Rob', id: 2, age: 42 },
    { name: 'Ted', id: 5, age: 43 },
    { name: 'Hap', id: 4, age: 54 }
  ]


**limit()**
new Jql(entireData).where('age >= ?', 25).limit(2).query()
  [
    { name: 'Rob', id: 2, age: 42 },
    { name: 'Hap', id: 4, age: 54 }
  ]


**offset()**
  new Jql(entireData).where('age >= ?', 25).offset(1).query()
  [
    { name: 'Hap', id: 4, age: 54 },
    { name: 'Ted', id: 5, age: 43 }
  ]


**select()**
  new Jql(entireData).where('age >= ?', 25).select('name').query()
  ['Rob', 'Hap', 'Ted']


**scope()**
You're able to create a scopes. It stores all query options within new query model:

  var q1 = new Jql(entireData).where('age >= ?', 25);
  var q2 = q1.scope();

  q1.where('name != 'Rob').query()
  [
    { name: 'Hap', id: 4, age: 54 },
    { name: 'Ted', id: 5, age: 43 }
  ]

  q2.where('name != ?', 'Hap').order('age')
  [
    { name: 'Rob', id: 2, age: 42 },
    { name: 'Ted', id: 5, age: 43 }
  ]

This means that when you create a scope you get a brand new query selector based on another one.

Scopes could be usefull if you want to apply save queries options for different data sets


  var searchScope = new Jql().select('name').where('age > ', 20).where(function(dataItem) {
    dataItem item.name.match(/[a-z]$/);
  }.order('age', true).limit(10).scope();

  searchScope.from(dataSet1).query();
  searchScope.from(dataSet2).query();
  searchScope.from(dataSet3).offset(1).query();
