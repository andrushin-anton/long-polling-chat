var clients = [];
var config = require('./config/config.json');
var mongoose = require('mongoose');
var dbConUrl = process.env.MONGOHQ_URL || config.db;
//подключаем бд
mongoose.connect(dbConUrl);

//создаем схему сообщений
Schema = mongoose.Schema;
var schema = new Schema({
	text: {
		type: String,
		required: true
	},
	created: {
		type: Number,
		default: new Date().getTime()
	}
});
var Message = mongoose.model('Message', schema);

exports.getData = function(req, res) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	clients.push(res);

	res.on('close', function() {
		clients.splice(clients.indexOf(res), 1);
	});
};

exports.getHistory = function(req, res) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	Message.find({},{},{sort:{created:1}},function(err,messages){
			if(err)
				res.end("");
			else
				res.end(JSON.stringify(messages));
	});
};

exports.send = function(req, res) {
	var body = '';
	req
		.on('readable', function() {
			body += req.read();
			if (body.length > 1e4) {
				res.statusCode = 413;
				res.end("Ваше сообщение слишком большое");
			}
		})
		.on('end', function() {
			try {
				body = JSON.parse(body);
			} catch (e) {
				res.statusCode = 400;
				res.end("Плохой запрос");
				return;
			}

			if(body.message.length == 0) {
				res.statusCode = 411;
				res.end("Ваше сообщение не должно быть пустым");
				return;
			}

			var message = new Message({text: body.message, created: new Date().getTime()});
			message.save(function(err){
				if(err) console.log('Сообщение не сохранилось');
				clients.forEach(function (res) {
					res.end(body.message);
				});
				clients = [];
				res.end('ok');
			});
		});
};