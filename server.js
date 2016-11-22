var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//Get request to display all todo items.
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};
	// var filteredTodos = todos;

	if(query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%'+query.q+'%'
		}
	}

	// //Filter todos by either true or false
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	db.todo.findAll({where: where}).then(function(todos) {
		if(todos) {
			res.json(todos);	
		} else {
			res.status(404).send();
		}
		
	}, function(e) {
		res.status(500).send();
	});
});

//Get request to show todo item by id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId).then(function(todo){
		if(todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send({
				error: "No todo with an id of " + todoId
			});
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Adding a new todo
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e){
		res.status(400).json(e);
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	//setting a matchedTodo variable to an object in todos where the id = todoId
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	} else {
		//Updating the todos array with the matchedTodo being removed 
		todos = _.without(todos, matchedTodo);
		//sending the body of the delete todo
		res.json(matchedTodo);

	}
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};


	if (!matchedTodo) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	}

	//If req has completed attribute and that it's a boolean value
	//if not and it was still provided, send a 400
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	//If req has description attribute and that it's a string value with a trimed length of more than 0
	//if not and it was still provided, send a 400
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});