const http = require('http');
const url = require('url');
const fs = require('fs');

const file = './users.json';

const getUsers = () => JSON.parse(fs.readFileSync(file, 'utf-8'));
const saveUsers = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

http.createServer((req, res) => {
  const [ , resource, param ] = url.parse(req.url, true).pathname.split('/');
  const id = parseInt(param);

  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    const users = getUsers();

    if (req.method === 'GET' && resource === 'users') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(id ? users.find(u => u.id === id) : users));
    }

    if (req.method === 'POST' && resource === 'users') {
      if (!body) return res.end();
      const user = JSON.parse(body);
      user.id = users.length ? users[users.length - 1].id + 1 : 1;
      users.push(user);
      saveUsers(users);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    }

    if (req.method === 'PUT' && resource === 'users' && id) {
      if (!body) return res.end();
      const i = users.findIndex(u => u.id === id);
      if (i === -1) return res.end();
      users[i] = { id, ...JSON.parse(body) };
      saveUsers(users);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users[i]));
    }

    if (req.method === 'DELETE' && resource === 'users' && id) {
      const newUsers = users.filter(u => u.id !== id);
      saveUsers(newUsers);
      res.writeHead(204);
      res.end();
    }
  });
}).listen(3000);
