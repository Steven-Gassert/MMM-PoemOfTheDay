function detectLanguage(key) {
	this.detect = async function (sentances, callback) {
		callback(null, [[{language: "en"}], [{language: "es"}], [{language:"fr"}]]);
	};
}

module.exports = detectLanguage;
