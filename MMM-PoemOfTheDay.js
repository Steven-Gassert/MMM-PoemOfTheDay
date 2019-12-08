Module.register("MMM-PoemOfTheDay",{
	// Default module config.
	defaults: {
		title: "Loading ...",
		content: "",
		name: ""
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
			this.sendSocketNotification("START");
		}
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		var title = document.createElement("h2");
		title.innerText = this.config.title;
		wrapper.appendChild(title);
		var content = document.createElement("p");
		content.innerText = this.config.content;
		wrapper.appendChild(content);
		var name = document.createElement("h4");
		name.innerText = this.config.name;
		wrapper.appendChild(name);
		return wrapper;
	}
});
