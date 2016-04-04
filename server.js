/* By Fernando Soto @ferso
contact: erickfernando@gmail.com
-------------------------------------- */
var http  = require('http');
var fs    = require('fs');
var url   = require("url");
var path  = require("path");

// Server Port 
var port  = 8001;

// Document Root
var file  	 = 'index.html';
var docroot  = 'public'; 
// Server ----------------------------------------

http.createServer(function (req, res) {
	 try{
	 var uri  = url.parse(docroot+'/'+req.url).pathname
	    ,src  = path.join(process.cwd(), uri)
	     src  = fs.statSync(src).isDirectory() ? src+'/'+file : '/'+src ;	  	 
	 	fs.readFile(src,'binary',function(err,data){ 
			res.writeHead(200);
		    res.write(data,'binary'); 
		    res.end();
		});
	 }catch(e){
	 	// console.error(e);
	 	res.end();
	 }	
}).listen(port);

//------------------------------------------------------------
console.log('=========================================================');
console.log('Server running at http://localhost:' + port);
console.log('=========================================================');