(function() {

    
    /**
     * @constructor Jql
     * @param source {Array} array of objects to be used as sourse
     * source param is optional - it's possible to set it later with `from` method
     */
    var Jql = function(source) {
        this.querySettings = {
            where: null,
            from: source,
            select: null,
            limit: null,
            offset: null
        };
    };


    /**
     * @description Creates assignment methods: `select`, `limit`, `offset`, `from`
     * All of them just assign the param to the querySettings object
     * and return Jql instance for chainability.
     */
    var assignments = ['select', 'limit', 'offset', 'from'];
    for (var i = 0, l = assignments.length; i < l; i ++) {
        (function(methodName) {
            /**
             * @method [select, limit, offset, from]
             * @param param
             * @return {Object} Jql instance
             */
            Jql.prototype[methodName] = function(param) {
                this.querySettings[methodName] = param;
                return this;
            };
        })(assignments[i]);
    }


    /**
     * @method scope
     * @description Creates a new instance of Jql object with stored settings.
     * Could be used to create queries "brunches",
     * or to create a search settings within different sources
     * @return {Object} - new Jql instance with stored settings
     *
     * @example:
     *      var users = new Jql(usersList).order('name').select('name');
     *      var males = users.scope().where('gender = male').q();
     *      var females = users.scope().where('gender = female').q();
     *
     *      var searchQueue = new Jql().select('name').where('age > ?', 20).order('name', true);
     *      var filtredProducers = searchQueue.scope().from(producersList).q();
     *      var filtredCustomers = searchQueue.scope().from(customersList).q();
     */
    Jql.prototype.scope = function() {
        var scoped = new Jql();
        for (var i in this.querySettings) {
            if (this.querySettings.hasOwnProperty(i)) {
                scoped.querySettings[i] = this.querySettings[i];
            }
        }
        return scoped;
    };


    /**
     * @method where
     * @description Adds `where` condition for the query. Can use function, strings
     * @return {Object} Jql instance
     *
     * @example
     *
     *      new Jql(usersList).where(function(user) {
     *          return user.name.length > 2 && user.age >= 30;
     *      });
     *
     *      new Jql(usersList).where('age >= 25');
     *      new Jql(usersList).where('age >= ?', 25);
     *      new Jql(usersList).where('age between ?', [10, 30]);
     */
    Jql.prototype.where = function() {
        this.querySettings.where = arguments;
        return this;
    };


    /**
     * @method order
     * @description Adds ordering property
     * @param field {String|Function} field name to be used for ordering or function that will be used for sort();
     * @param desc {Boolean} will order descending if true
     * @return {Object} Jql instance
     *
     * @example
     *
     *      new Jql(usersList).order('name');
     *      new Jql(usersList).order('name', true);
     */
    Jql.prototype.order = function(field, desc) {
        this.querySettings.order = {
            field: field,
            desc: desc
        };
        return this;
    };


    /**
     * @method query, q
     * @description runs query with all settings applied before
     * @return {Array} query result
     */
    Jql.prototype.query = Jql.prototype.q = function() {
        var q = this.querySettings, result = clone(q.from);
        if (q.where) result = where(result, q.where);
        if (q.order) result = order(result, q.order);
        if (q.select) result = select(result, q.select);
        if (q.offset) result = result.slice(q.offset);
        if (q.limit) result = result.slice(0, q.limit);
        return result;
    };


    /**
     * @method addCondintion
     * @description adds new condition to the list that it could be used for literal `where` conditions
     * @param name {String} - operator name
     * @param filter - function that filter source
     */
    Jql.addCondition = function(name, filter) {
        conditions[name] = filter;
    };


    /**
     * @method getCondition
     * @description gets condition by its name
     * @param name {String} - operator name
     * @return {Function} condition method
     */
    Jql.getCondition = function(name) {
        return conditions[name];
    };


    /**
     * @method getConditions
     * @description gets condition by its name
     * @return {Object} all conditions list
     */
    Jql.getConditions = function() {
        return conditions;
    };


    var conditions = {
        'within': function(field, value) {
            for (var i = 0, l = value.length; i < l; i ++) {
                if (value[i] == field) {
                    return true;
                }
            }
            return false;
        },
        'between': function(field, value) {
            return field >= value[0] && field <= value[1];
        },
        '>': function(field, value) {
            return field > value;
        },
        '>=': function(field, value) {
            return field >= value;
        },
        '<': function(field, value) {
            return field < value;
        },
        '<=': function(field, value) {
            return field <= value;
        },
        '*=': function(field, value) {
            return field.indexOf(value) > -1;
        },
        '^=': function(field, value) {
            return field.substr(0, value.length) == value;
        },
        '$=': function(field, value) {
            return field.substr(field.length - value.length) == value;
        },
        '=': function(field, value) {
            return field == value;
        },
        '==': function(field, value) {
            return field === value;
        },
        '!=': function(field, value) {
            return field != value;
        }
    };


    var select = function(sourse, field) {
        if (!field) return sourse;
        var result = [];
        for (var i = 0, l = sourse.length; i < l; i ++) {
            result.push(sourse[i][field]);
        }
        return result;
    };

    
    var where = function(sourse, where) {
        var results = [];

        if (where.length == 2 || typeof where[0] == 'String') {
            var parts = where[0].split(' ');
            var field = parts[0], fn = conditions[parts[1]], value = (where.length == 2 ? where[1] : parts[2]);
            for (var i = 0, l = sourse.length; i < l; i ++) {
                if (fn(sourse[i][field], value)) results.push(sourse[i]);
            }
        } else {
            for (var j = 0, k = sourse.length; j < k; j ++) {
                if (where[0](sourse[j])) results.push(sourse[j]);
            }
        }
        return results;
    };


    var order = function(source, order) {
        if (typeof order.field == 'string') {
            return source.sort(order.desc ? (function(a, b) {
                var x = a[order.field], y = b[order.field];
                return (x >= y) ? - 1 : 1;
            }) : function(a, b) {
                var x = a[order.field], y = b[order.field];
                return (x <= y) ? -1 : 1;
            });
        } else {
            return source.sort(order.field);
        }
    };


    var clone = function(arr) {
        return arr.concat();
    };

    window.Jql = Jql;

})();

