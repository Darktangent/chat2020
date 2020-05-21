const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const app = express();
const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../public')));
const welcomeMsg = `Welcome to the chat app`;
io.on('connection', (socket) => {
	console.log('web socket connection established');
	socket.emit('message', generateMessage(welcomeMsg));
	socket.broadcast.emit('message', generateMessage(`A new user has joined`));
	// ack
	socket.on('sendMessage', (chatText, callback) => {
		const filter = new Filter();
		if (filter.isProfane(chatText)) {
			return callback('Profanity is not allowed');
		}
		io.emit('message', generateMessage(chatText));
		callback();
	});
	// sendLocation
	socket.on('sendLocation', (coords, callback) => {
		io.emit(
			'locationMessage',
			generateLocationMessage(
				`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
			)
		);
		callback();
	});

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left'));
	});
});

server.listen(port, () => {
	console.log(`Listening on ${port}`);
});
