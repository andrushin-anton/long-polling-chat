var http = require('http');
var url = require('url');
var chat = require('./chat');
var config = require('./config/config.json');
var helper = require('./helper');
var port = process.env.PORT || config.port;

/*
 * Создаем сервер - входная точка
 */
http.createServer(function(req, res) {
	//проверяем если пользователь не авторизован, то направляем его на страницу авторизации
	var parsedUrl = url.parse(req.url);

	if(parsedUrl.pathname != '/login' && !helper.isAuthenticated()) {
		redirect('/login', res);
	}
	//выдаем запрашиваемый ресурс
	switch (parsedUrl.pathname) {
		//главная
		case '/':
			helper.sendFile("views/index.html", res);
			break;
		//страница авторизации
		case '/login':
			helper.sendFile("views/login.html", res);
			break;
		//post запрос для добавления сообщения в чат
		case '/send':
			chat.send(req, res);
			break;
		//возвращает последнее добавленное сообщение
		case '/get':
			chat.getData(req, res);
			break;
		//возвращает историю сообщений
		case '/history':
			chat.getHistory(req, res);
			break;

		default:
			res.statusCode = 404;
			res.end('Page Not Found');
	}

}).listen(port);