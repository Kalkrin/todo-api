var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


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
	res.json(todos);
});

//Get request to show todo item by id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	//setting a matchedTodo variable to an object in todos where the id = todoId
	var matchedTodo = _.findWhere(todos, {id: todoId});

	//send the matched todo or if no match was found, send a 404
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		console.log('undefined todo');
		res.status(404).send();
	}
});

//Adding a new todo
app.post('/todos', function(req, res) {
	//getting the body of the request and getting rid of any attributes that are not 
	//description or completed
	var body = _.pick(req.body, 'description', 'completed');

	//checking that description is a string and completed is a boolean
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	//Eliminating access spaces at beggining or end of description string
	body.description = body.description.trim();
	//adding the id field
	body.id = todoNextId;
	//pushing the todo item to the array
	todos.push(body);
	//incrementing the id so it's 1 more than the last
	todoNextId += 1;
	//Sending the new body (todo) to the user
	res.json(body);
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	//setting a matchedTodo variable to an object in todos where the id = todoId
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if(!matchedTodo) {
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		//Updating the todos array with the matchedTodo being removed 
		todos = _.without(todos, matchedTodo);
		//sending the body of the delete todo
		res.json(matchedTodo);

	}
});	

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT +  '!');
});