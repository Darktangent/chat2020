const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users');
const app = express();
const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../public')));
const welcomeMsg = `Welcome to the chat app`;
// connection established
io.on('connection', (socket) => {
	console.log('web socket connection established');
	// on join
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });
		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('Admin', welcomeMsg));
		socket.broadcast
			.to(user.room)
			.emit('message', generateMessage('Admin', `${user.username} has joined`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
		callback();
	});
	// ack
	// sendMessage
	socket.on('sendMessage', (chatText, callback) => {
		const filter = new Filter();
		if (filter.isProfane(chatText)) {
			return callback('Profanity is not allowed');
		}
		const info = getUser(socket.id);

		io.to(info.room).emit('message', generateMessage(info.username, chatText));
		callback();
	});
	// sendLocation
	socket.on('sendLocation', (coords, callback) => {
		const info = getUser(socket.id);

		io.to(info.room).emit(
			'locationMessage',
			generateLocationMessage(
				info.username,
				`https://google.com/maps?q=${coords.latitude},${coords.longitude}`
			)
		);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				'message',
				generateMessage('Admin', `${user.username}, has left`)
			);
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Listening on ${port}`);
});
