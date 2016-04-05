var liveServer = require("live-server");
var params = {
	port: 8001,
	host: "localhost",
	root: "public", 
	file: "index.html",
    open: true    
};
liveServer.start(params);