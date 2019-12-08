const NodeHelper = require("node_helper");
const axios = require("axios");
const config = require("./config");
var DetectLanguage = require("detectlanguage");
var detectLanguage = new DetectLanguage({
	key: process.env.LANGUAGE_DETECTION_API_KEY
});
require("dotenv").config();

module.exports = NodeHelper.create({
	socketNotificationReceived: async function(noti, payload) {
		if (noti === "START") {
			const poem = await getPoem();
			this.sendSocketNotification("UPDATE", poem);
		}
	}
});

async function getPoem() {
	let poem;
	while (!poem) {
		try {
			let { data: poems } = await axios.get(
				"https://www.poemist.com/api/v1/randompoems"
			);
			poems = poems.filter(poem => poem.content);
			poems = await filterByLanguage(poems);
			poems = filterBySize(poems);
			if (poems) {
				// pick a random poem from the poems that are within language and size configs
				poem = poems[Math.floor(Math.random() * poems.length)];
			}
		} catch (e) {
			console.log(
				"there was most likely an error fetching poems from https://www.poemist.com/api/v1/randompoems, waiting 3 seconds before trying again"
			);
			console.log("error = ", e);
			await setTimeout(3000, () => {});
		}
	}
	return poem;
}

// for a full list of supported languages see https://ws.detectlanguage.com/0.2/languages
async function filterByLanguage(poems) {
	if (
		process.env.ENABLE_LANGUAGE_DETECTION &&
    process.env.LANGUAGE_DETECTION_API_KEY
	) {
		const poemsContent = poems.map(poem => poem.content);
		const languages = await new Promise((resolve, reject) => {
			detectLanguage.detect(poemsContent, (err, result) => {
				resolve(result);
			});
		});
		poems = poems.filter((poem, i) => {
			if (!languages[i][0].language) {
				// if the detect languages API stops working for some reason, we don't want to discard all poems
				return true;
			} else {
				return config.languageSet.includes(languages[i][0].language);
			}
		});
		return poems;
	} else {
		return poems;
	}
}

function filterBySize(poems) {
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
