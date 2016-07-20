var mongoose = require('mongoose');

var schema = new mongoose.Schema({
		term:String,
		when: Date
	});
var model = mongoose.model('imgsearch', schema);

module.exports = {
	saveSearch: function(term, callback) {

		var newUrl = new model({term:term, when:new Date});
		return newUrl.save().then(function(result) {
			callback(result);
			});
	},
	getSearchHistory: function(callback) {
		model.find({},'term when -_id').sort({when: -1}).limit(10).exec( function(err, results) {
			if (err) {
				callback({err:"Unable to retrieve data: " + err});
			} else {
				callback(results);
			}
		});
	}

}
