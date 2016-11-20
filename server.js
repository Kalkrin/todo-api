var express = require('express');
var bodyParser = require('body-parser');
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
	var todoId = req.params.id;
	var matchedTodo;
	//for each todo item
	todos.forEach(function(todo) {
		//if the id sent from the request is equal to the todo items id
		if(todo.id.toString() === todoId){
			//set matched todo = the todo item that matched
			matchedTodo = todo;
		}
	});
	//send the matched todo or if no match was found, send a 404
	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		console.log('undefined todo');
		res.status(404).send();
	}
});

app.post('/todos', function(req, res) {
	var body = req.body;
	body.id = todoNextId;

	todos.push(body)

	todoNextId += 1;

	res.json(body);
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT +  '!');
});