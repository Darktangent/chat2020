const users = [];

// addUser
const addUser = ({ id, username, room }) => {
	// clean data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();
	// validate data
	if (!username || !room) {
		return {
			error: 'Username and room are required',
		};
	}
	// check for user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});
	// Validate username
	if (existingUser) {
		return {
			error: 'Username is in use',
		};
	}
	// store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};
// addUser({ id: 123, username: 'rohan', room: 'houston' });
// const res = addUser({ id: 33, username: 'jess', room: 'houston' });
// console.log(res);

// removeUser
const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id;
	});
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

// getUser
const getUser = (id) => {
	const user = users.find((user) => {
		return user.id === id;
	});
	if (!user) {
		return undefined;
	}
	return user;
};

// getUsersInRoom
// const getUsersInRoom = (room) => {
// 	room = room.trim().toLowerCase();
// 	const foundUsers = users.find((user) => {
// 		return user.room === room;
// 	});
// 	if (!foundUsers) {
// 		return [];
// 	} else {
// 		return foundUsers;
// 	}
// };
const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	return users.filter((user) => user.room === room);
};
// console.log(getUsersInRoom('houston'));
module.exports = { addUser, removeUser, getUser, getUsersInRoom };
