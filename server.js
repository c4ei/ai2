// npm init -y 
// npm install express cors
// node server.js

const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());
var corsOptions = {
	origin: 'https://ai.c4ei.net',
	credentials: true
}
app.use(cors(corsOptions));

app.use(express.static( path.join(__dirname, './client/dist') ))

app.get('/', function(req,resp){
  resp.sendFile( path.join(__dirname, './client/dist/index.html') )
}) 
//이 코드는 항상 가장 하단에 놓아야 잘됩니다. 
app.get('*', function (req, resp) {
  resp.sendFile(path.join(__dirname, './client/dist/index.html'));
});


app.listen(3333, function () {
  console.log('ai.c4ei.net listening on 3333')
}); 