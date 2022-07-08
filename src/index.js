const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  user = users.find(user => user.username === username);
  
  if (!user) {
    return response.status(404).send({ error: "User not found" });
  }

  request.user = user;
  
  next();
}

function getTodoById(request, response) {
  const { user } = request;
  const { id } = request.params;

  todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).send({error: "todo not found"});
  }

  return todo;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).send({error: "User already exists!"});
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline} = request.body;

  todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  
  todo = getTodoById(request, response);  

  todo.title = title;
  todo.deadline = deadline;
  
  return response.status(201).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  todo = getTodoById(request, response);
  todo.done = true;
  
  return response.status(201).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if (!getTodoById(request, response)) {
    return response.status(404).send();
  }

  user.todos = user.todos.filter(todo => { todo.id !== id});

  return response.status(204).send();
});

module.exports = app;