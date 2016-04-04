/*!
 * DataChooser v0.1
 * Developed by @ferso, 
 * Fernando Soto erickfernando@gmail.com
 * Evisualmx.com
 * http://ferso.mx/DataChooser/

Copyright (c) 2015 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


(function($){

	$.fn.DataChooser = function(options) {

		/* 
		# Default Options 
		--------------------------------------------------- */
		var _defaults = {
			
			 // Table identifier		
			 id					: String($(this).attr('id')).replace('#',''),
			
			 // Set the table width 
			 width				: '100%',			 
			
			 // Set the url where data coming  http://localhost:1338/data
			 source 			: null,
			
			 // Parameters requiered in the request
			 params 			: {}, 
			 
			 // Request Method for data  _POST, _GET. Default is _GET
			 method 			: 'GET', 

			 //template for data chooser elements
			 template			: null,

			 // Allow abort previous ajax request. Default is false
			 allowAbort         : false, 
			
			 // Set ID key in the collection. Default is the First key in the collection
			 primary			: false,
			 
			 // Set load at start: Boolean : true | false
			 auto 				: true, 			 
			
			 // Set colums headers
			 headers			: {},

			 // Set table draw the headers
			 showHeaders		: true,
			
			 // Max rows in request
			 rows 				: 100,
			
			 // Page to start the table
			 page 				: 1,
			
			 // Max draw pages in the view
			 mpv				: 5,
			 
			 // Set visible navigation 
			 navigation			: false,
			 
			 // Set checkbox column 
			 checkbox 			: false,
			
			 // Set Draw Grid
			 drawgrid 			: false,
			 
			 // Set Draw Checkall input 
			 checkallInput		: false,
			
			 // Set Draw Search input 
			 searcher			: true,
			 
			 // Set Animation loading data 
			 animation			: true,
			
			 // Sortable columns table, in each column configuration can be overrided for custom controll
			 sortable			: false,

			 // Set status from elements to hide automaticly
			 hideStatus			: false,

			 // Set label for display hidding elements
			 hideLabel			: 'Show hidden elements',

			 // Set enable button for load more elements
			 showMore			: false,

			 // Set label for button load more elements
			 showMoreLabel			: 'Load more',
			
			 // Set placeholder text in the seach input
			 searchtext			:'Enter keyword to find, press enter',
			
			 // This callback is called before ajax request is started. Return  full table object
			 onBeforeRequest 	: function(){},

			 // This callback is called when ajax request is faild. Return XHR object
			 onRequestFail 	: function(){},
			
			 // This callback is called when request is completed and drawed table with the data. Return data object request and full table object
			 onCompleteRequest	: function(){},
			
			 // This callback is called before the data row is drawed, return row object
			 onBeforeCreateRow	: function(){},
			
			 // This callback is called when checkallInput is checked return all primary values selected
			 onCheckBoxMain		: function(){},

			 // This callback is called when a checkbox in row is checked
			 onCheckBox 		: function(){},

			 // This callback is called before create data cell
			 onBeforeCreateCell	: function(){},


			 // This callback is called when user click in element
			 onClick	: function(){},

			// This callback is called when link is clicked
			 onLink	: function(){},


		}		

		//the main container
		this._container = $(this);

		// Extend Options with Default
		this._options 	   = $.extend(_defaults, options);



		/* -----
		# Set initial Page Request
		-------------------------------------------------------------- */

		// the current page
		this._page          = this._options.page;
		
		// count rows in request
		this._rows          = this._options.rows;

		// headers columns
		this._headers       = this._options.headers;
		
		// Keyword request 
		this._keyword       = null;
		
		// sort field request
		this._sortfield     = null;
		
		// sort order request
		this._sortby        = null;

		// the data return
		this._data        	= {}; 

		// the columns config
		this._conf 			= {};

		// collection checked
		this._collection    = [];

		// draw container
		this.drawContainer();

		// auto start
		if( this._options.auto ) this.load();
					
		//return full object;
		return this;
	},

	/* -----
	# @name test
	# this is a simple function for plugin installation testing
	-------------------------------------------------------------- */
	$.fn.test = function (){
		console.log('ok');
	},	

	/* -----
	# @name g
	# clean data in collection
	-------------------------------------------------------------- */
	$.fn.uniq = function(collection){
		collection.reduce(function(a,b){
		    if (a.indexOf(b) < 0 ) a.push(b);
		    return a;
			 },[]);
		return collection;
	},

	/* -----
	# @name getKeyWord
	# get the keyword
	-------------------------------------------------------------- */
	$.fn.unbindKeyRequest = function(k){		
		delete this._options.params[k];
	},

	/* -----
	# @name showLoader
	# This function show the loader spinner
	-------------------------------------------------------------- */
	$.fn.showLoader = function(){	
		$('#'+this._options.id +' .main-loader').removeClass('fa fa-search').addClass('csspinner traditional');				
	},

	/* -----
	# @name hideLoader
	# This function hide the loader spinner
	-------------------------------------------------------------- */
	$.fn.hideLoader = function(){
		$('#'+this._options.id +' .main-loader').removeClass('csspinner traditional').addClass('fa fa-search');
	},

	/* -----
	# @name createRow()
	# Create a row table DOM
	# @return HTMLTableRowElement TableRow
	-------------------------------------------------------------- */
	$.fn.createRow = function( id ){
		var row = document.createElement('tr');
			row.id  = this._options.id + '-row-'+ id;
			this.mainTableBody.appendChild(row);
		return row;
	},

	/* -----
	# @name addToCollection()
	# @return void
	-------------------------------------------------------------- */
	$.fn.addToCollection = function(value,rw){
		this._collection.push(value);
		this._collection = this.uniq( this._collection );
		this._options.onCheckBox.call(this,value,this._collection,rw);
	},

	/* -----
	# @name removeToCollection()
	# @return void
	-------------------------------------------------------------- */
	$.fn.removeToCollection = function(value){
		var index = this._collection.indexOf(value);
		if (index > -1) {
		    this._collection.splice(index, 1);
		}
		this._options.onCheckBox.call(this,value,this._collection);
	},

	/* -----
	# @name twoDigits()
	# @return void
	-------------------------------------------------------------- */
	$.fn.twoDigits  = function (d) {
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	},
	$.fn.numberWithCommas = function(x) {
	    x = x.toString();
	    var pattern = /(-?\d+)(\d{3})/;
	    while (pattern.test(x))
	      x = x.replace(pattern, "$1,$2");
	    return x;
	  },

	  $.fn.nFormatter = function(x) {
	    if (x >= 1000000000) { return (x / 1000000000).toFixed(2).replace(/\.0$/, '') + ' G'; }
	    if (x >= 1000000) { return (x / 1000000).toFixed(2).replace(/\.0$/, '') + ' M'; }
	    if (x >= 1000) { return (x / 1000).toFixed(2).replace(/\.0$/, '') + ' K'; }
	    return x;
	  },
	/* -----
	# @name toDateTime()
	# @return void
	-------------------------------------------------------------- */
	$.fn.toDateTime = function(str){
		var date = new Date(str);
		date.getUTCFullYear() + "-" + this.twoDigits(1 + date.getUTCMonth()) + "-" + this.twoDigits(date.getUTCDate()) + " " + this.twoDigits(date.getUTCHours()) + ":" + this.twoDigits(date.getUTCMinutes()) + ":" + this.twoDigits(date.getUTCSeconds());
	},

	/* -----
	# @name replaceWithData()
	# @return void
	-------------------------------------------------------------- */
	$.fn.getTemplate = function(rowset) {
        var html, prop, regex;
       	
       //	that.nFormatter();

       	var html = this._options.template;
       	for (key in rowset) {
            reg = new RegExp('{{' + key + '}}', 'ig');
          
         	var value = typeof( rowset[key])  == 'number' ? this.nFormatter(rowset[key]) : rowset[key];

            html = (html).replace(reg, value);
        }     
        return $(html);
    },

    /* -----
	# @name createTable()
	# Create the table object
	# @return void
	-------------------------------------------------------------- */
    $.fn.setActive = function(e){
    	$('#'+e).addClass('active');
    },

	/* -----
	# @name createTable()
	# Create the table object
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawContainer = function(){

		// general table calls
		this._container.addClass('zdatachooser');

		// set drawSearch
		this.drawSearch();

		// tbody 
		this.mainBody 				= document.createElement('div');
		this.mainBody.id 	       	= this._options.id+'-zdata-chooser-body';
		this._container.append(this.mainBody);

		// tbody 
		this.mainBodyHidden 		= document.createElement('div');
		this.mainBodyHidden.id 	       	= this._options.id+'-zdata-chooser-body-hidden';
		this._container.append(this.mainBodyHidden);
		
	 },

	/* -----
	# @name _search
	# This function do the search ajax request
	-------------------------------------------------------------- */
	  $.fn._search = function(){
		var that 		 = this;
		this._page 		 = 1;
		this._collection = [];
		if (window.keyTimeout_) {
				clearTimeout(window.keyTimeout_);
		}
		var callMethod = function(){
			that.load();
		}
		window.keyTimeout_ = setTimeout(callMethod, 1000);
	  },

	  /* -----
	  * createSearch()
	  * create the Search input in the table
	  * @return void
	  -------------------------------------------------------------- */
	  $.fn.drawSearch = function(s ){
	  	
	  	var that = this;

		if( this._options.searcher ){

			this.sic 	       	   		= document.createElement('div');
			this.sic.className     		= 'search-container rpw input-group';
			this._container.append(this.sic);

			// ------------------------------------------------------------

			this.searchInput 	         = document.createElement('input');
			this.searchInput.type        = 'search';
			this.searchInput.placeholder = this._options.searchtext;
			this.searchInput.className   = ' form-control' ;
			this.sic.appendChild( this.searchInput );
			this.searchInput = $( this.searchInput );

			// input-group-addon
			var gspan 	       	   		= document.createElement('div');
			gspan.className     		= 'input-group-addon';
			this.sic.appendChild(gspan);

			// loader_icon_search
			var gspanicon 	       	   	= document.createElement('div');
			gspanicon.id                = 'loader_icon_search';
			gspanicon.className     	= 'fa fa-search main-loader';
			gspan.appendChild(gspanicon);

			// search input blur action
			this.searchInput.blur(function(e){
			 	e.preventDefault();
				if( that.searchInput.val() == ''  ) {
					that._keyword = null;
				}else{
					that._search();
				}
			});

			// search input key actions 
			this.searchInput.keyup(function(e){
					e.preventDefault();
			    if(  ( that.searchInput.val() != '' ) ){
					that._keyword = that.searchInput.val();
					that._search();
			    }else{
			    	that._keyword = null;
			    	that._search();
			    }
			});			
	 	}
	  },

	/* -----
	# @name createHeaders()
	# create the headers in the table
	#
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawHeaders = function(){

		$(this.mainTableHead).html('');

		var that     = this;		 	
		var iterator = 1;

	},

	/* -----
	# @name drawBody()
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawBody  = function(){
		
		var i 		  = 0;	
		var that      = this;
		var count 	  = this._data.length;
		this._dataSet = []; 

		$(this.mainBody).html('');		
		$.each(this._data, function(i,rowset){		
			var theid   = 'dsh-row-'+rowset.id;
			that._dataSet[rowset.id] = rowset;
			var element = that.getTemplate(rowset);			
			$(that.mainBody).append(element);
			$(element).attr('id',theid);
			// $(element).prepend('<input type="checkbox" value="1">ss');
			var element 			= document.getElementById(theid);			
				element.className   = 'row';
				element.dataset.id  = rowset.id;
				element.onclick     = function(e){
					e.preventDefault();
					// that.active(this);
					that.setActive(this.id);
					that._options.onClick.call(this,that._dataSet[this.dataset.id]);		
				}
				if(that._options.hideStatus){					
					if( that._options.hideStatus == rowset.status){			
						$(element).addClass('hide');					
					}
				}
		});

		that.createShowHiden();
		that.createShowMore();
	},
	/* -----
	# @name createShowHiden
	# This function show hidden elements in the view
	-------------------------------------------------------------- */
	$.fn.createShowHiden = function(){
		var that = this;
		var div = document.createElement('div');
			div.className = 'row';
			div.innerHTML = '>>'+this._options.hideLabel;
			this.mainBody.appendChild(div);

			div.onclick     = function(e){
				e.preventDefault();
				if( typeof(this.open) != 'undefined' && this.open == true ){
					console.log('fuck yeah!');
					this.open = false;
					this.innerHTML = '>> Show more';
					$('#'+that.mainBody.id+' .show').removeClass('hide').addClass('hide');
				}else{
					console.log('wtf');
					this.open = true;
					this.innerHTML = '>> Hide More';
					$('#'+that.mainBody.id+' .hide').removeClass('hide').addClass('show');
				}
				
			}
	},

	/* -----
	# @name createShowMore
	# This function load more elements in the view
	-------------------------------------------------------------- */
	$.fn.createShowMore = function(){

	},

	/* -----
	# @name load
	# This function do the ajax request
	-------------------------------------------------------------- */
	$.fn.load = function (){

		var that = this;
		
		this._options.params.rows   = this._rows;
		
		// The Serch Keyword
		if(that._options.searcher )
			that._options.params.keyword  = that._keyword != null ?  that._keyword : that.unbindKeyRequest('keyword');

		// Sort keys --------------------------------------
		if( this._sortfield == null ){		
			that.unbindKeyRequest('sortfield');
			that.unbindKeyRequest('sortby');
		}else{
			this._options.params.sortfield = this._sortfield;
			this._options.params.sortby    = this._sortby;
		}

		// call onBeforeRequest callback 
		that._options.onBeforeRequest.call(that);

		// show loader spinner
		that.showLoader();

		// allow abort
		if(that._options.allowAbort){
			that._xhr.abort();
		}

		// this is the ajax request
		this._xhr = $.ajax({
		  method: String(that._options.method).toUpperCase(),
		  url:  that._options.source,
		  data: that._options.params
		})
		.fail(function(jqXHR, textStatus) {
		  console.error( "Table Error:" + jqXHR.getResponseHeader());		  
		  that._options.onRequestFail.call(that);
		})
		.done(function( source ) {	
		   that._xhr     = false;
		   that._data    = source.data;
		   that._pages   = typeof(source.pages)   == 'undefined' ? that._pages   : source.pages;
		   that._headers = typeof(source.headers) == 'undefined' ? that._headers : source.headers;
		   that.hideLoader();
		   that.render(data = null);
		});
	},

	$.fn.render = function(){
		
		var that = this;

		// //Create Table
		this.drawBody( data );

		// this drawHeaders
		this.drawHeaders();

		// onComplete Request
		this._options.onCompleteRequest.call(this);

	},

	$.fn.prepend = function(){


	};


})(jQuery);