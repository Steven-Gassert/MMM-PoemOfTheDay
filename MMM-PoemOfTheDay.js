Module.register("MMM-PoemOfTheDay",{
	// Default module config.
	defaults: {
		title: "Loading ...",
		content: "",
		name: "",
		textLimit: 1000,
		lineLimit: 10,
		detectLanguageApiKey: undefined,
		// for a full list of supported languages see https://ws.detectlanguage.com/0.2/languages
		languageSet: ["en", "es"],
		updateInterval: 300000 // milliseconds
	},

	socketNotificationReceived: function(noti, payload) {
		if (noti === "UPDATE") {
			const { title, content, poet: { name } } = payload;
			this.config.title = title;
			this.config.content = content;
			this.config.name = name;
			this.updateDom();
		}
	},

	notificationReceived: function(noti, payload){
		if(noti === "DOM_OBJECTS_CREATED") {
			this.sendSocketNotification("START", this.config);
		}
	},

	getDom: function() {
		const wrapper = document.createElement("div");
		const title = document.createElement("h2");
		title.innerText = this.config.title;
		wrapper.appendChild(title);
		const content = document.createElement("p");
		content.innerText = this.config.content;
		wrapper.appendChild(content);
		const name = document.createElement("h4");
		name.innerText = this.config.name;
		wrapper.appendChild(name);
		return wrapper;
	}
});
