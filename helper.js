var fs = require('fs');
/*
 * Проверяет если авторизован пользователь
 * @returns {boolean}
 */
exports.isAuthenticated = function() {
	return true;
}

/*
 * Отправляет файл клиенту
 * @param fileName
 * @param res
 */
exports.sendFile = function(fileName, res) {
	var file = fs.ReadStream(fileName);
	file
			.on('error', function(err){
				res.statusCode = 500;
				res.end('Ошибка сервера');
				console.log(err);
			})
			.pipe(res)
		//файл дочитал до конца и отдал все клиенту
			.on('close', function(){
				file.destroy();
			});
	//если пользователь закрыл браузер или соединение потерярось, но файл не прочитан до конца
	res.on('close', function(){
		file.destroy();
	})
}

/*
 * Перенаправляет на указанный урл
 * @param url
 * @param res
 */
exports.redirect = function(url, res) {
	res.statusCode = 302;
	res.setHeader("Location", url);
	res.end();
}