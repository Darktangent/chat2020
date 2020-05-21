const socket = io();
const chatForm = document.querySelector('#message-form');
const chatInput = document.querySelector('#message');
const sendBtn = document.querySelector('#send-message');
const sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// templates
const locationTemplate = document.querySelector('#location-template').innerHTML;
const messageTemplate = document.querySelector('#message-template').innerHTML;
// render
socket.on('message', (msg) => {
	console.log(msg);
	const html = Mustache.render(messageTemplate, {
		message: msg.text,
		createdAt: moment(msg.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
});
// location
socket.on('locationMessage', (url) => {
	console.log(url);
	const html = Mustache.render(locationTemplate, {
		url: url,
		createdAt: moment(url.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
});
const chatText = chatInput.textContent;
// submit
chatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	// disable form
	sendBtn.setAttribute('disabled', 'disabled');
	const message = e.target.elements.message.value;
	// acknowledge
	socket.emit('sendMessage', message, (error) => {
		// re-enable
		sendBtn.removeAttribute('disabled');
		chatInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log(`Message Delivered`);
		e.target.elements.message.value = '';
	});
	// console.log(chatText);
});
// send location and ack server response
sendLocation.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert(`Geolocation is not supported by your browser`);
	}
	sendLocation.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			() => {
				console.log('Location Shared');
				sendLocation.removeAttribute('disabled');
			}
		);
		console.log(position);
	});
});
