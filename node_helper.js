const NodeHelper = require("node_helper");
const axios = require("axios");
const DetectLanguage = require("detectlanguage");

module.exports = NodeHelper.create({
	socketNotificationReceived: async function(noti, payload) {
		if (noti === "START") {
			if (payload.updateInterval < 120000) {
				payload.updateInterval = 120000;
			}
			const self = this;
			(async function displayPoem () {
				const poem = await getPoem(payload);
				self.sendSocketNotification("UPDATE", poem);
				setTimeout(displayPoem, payload.updateInterval);
			})();
		}
	}
});

async function getPoem(config) {
	let poem;
	while (!poem) {
		try {
			let { data: poems } = await axios.get(
				"https://www.poemist.com/api/v1/randompoems"
			);
			poems = poems.filter(poem => poem.content);
			poems = await filterByLanguage(poems, config);
			poems = filterBySize(poems, config);
			if (poems) {
				// pick a random poem from the poems that are within language and size configs
				poem = poems[Math.floor(Math.random() * poems.length)];
			}
		} catch (e) {
			console.log(e);
			console.log(
				"there was most likely an error fetching poems from https://www.poemist.com/api/v1/randompoems, waiting 5 mins before trying again"
			);
			await new Promise((resolve) => { setTimeout(resolve, config.updateInterval); });
		}
	}
	return poem;
}

// for a full list of supported languages see https://ws.detectlanguage.com/0.2/languages
async function filterByLanguage(poems, config) {
	if (
		config.detectLanguageApiKey
	) {
		try {
			const detectLanguage = new DetectLanguage({
				key: config.detectLanguageApiKey
			});
			const poemsContent = poems.map(poem => poem.content);
			const languages = await new Promise((resolve, reject) => {
				detectLanguage.detect(poemsContent, (err, result) => {
					err ? reject(err) : resolve(result);
				});
			});

			poems = poems.filter((poem, i) => {
				if (!languages || !languages[i][0].language) {
					// if the detect languages API stops working for some reason, we don't want to discard all poems
					return true;
				} else {
					return config.languageSet.includes(languages[i][0].language);
				}
			});
			return poems;
		} catch (e) {
			console.log(e);
			console.log("There was an error filteringByLanguage, returning all poems");
			return poems;
		}
	} else {
		// return all poems if there is no detectLanguageApiKey
		return poems;
	}
}

function filterBySize(poems, config) {
	return poems.filter(poem => {
		const numberOfLines = poem.content.split("\n").length - 1;
		return (
			poem.content.length <= config.textLimit &&
      numberOfLines <= config.lineLimit
		);
	});
}

module.exports.getPoem = getPoem;
module.exports.filterByLanguage = filterByLanguage;
