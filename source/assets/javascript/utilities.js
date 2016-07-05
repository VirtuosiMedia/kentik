/**
 * A small utilities library.
 */
var _ = {

	/**
	 * A storage for cached templates.
	 * @type {Object}
	 */
	templates: {},

	/**
	 * Retrieves a JavaScript template, caches it, and then returns additional functions for manipulating the template.
	 * @param  {string} id The JavaScript template HTML id.
	 * @return {object}    The template object.
	 */
	template: function(id){
		if (!_.templates.hasOwnProperty(id)){
			_.templates[id] = document.getElementById(id).innerHTML;
		}

		return {
			id: id, //The template id.
			raw: _.templates[id], //The raw template content.
			text: _.templates[id], //The compiled template content.

			/**
			 * Populates a text with data for any named placeholders wrapped in curly brace format: {{placeholderName}}.
			 * @param  {object} data Placeholder name as the property name, the replacement value as the value.
			 * @return {object}      The template object for chaining.
			 */
			populate: function(data){
				var text = this.raw;
				for (var placeholder in data){
					var replace = new RegExp('{{' + placeholder + '}}', 'g');
					text = text.replace(replace, data[placeholder]);
				}
				this.text = text;
				return this;				
			},

			/**
			 * Renders the populated template in the target id.
			 * @param  {string} target (optional) The target HTML id.
			 * @return {string}        The populated template.
			 */
			render: function(target){
				if (target){
					document.getElementById(target).innerHTML = this.text;	
				} 

				return this.text;
			}
		}
	},

	database: {},

	data: {

		/**
		 * Loads a JSON file and stores it in memory.
		 * @param  {string} id     The database id to be assigned to the file data.
		 * @param  {string} source The path to the file.
		 * @return {Promise}       When the file is loaded, the data will be available in the database cache.
		 */
		load: function(id, source){
			return new Promise(function(resolve, reject){
				var request = new XMLHttpRequest();
				request.open("get", source, true);
				
				request.onreadystatechange = function(){
					if (request.readyState === 4){
						if (request.status === 200){
							_.database[id] = JSON.parse(request.responseText);
							resolve(_.database[id]);
						} else {
							console.log(path + ' could not be loaded. Error status: ' + request.statusText, 'error');
						}
					}
				};

				request.onerror = function() {
					reject(request.statusText);
				};				
		 
				request.send();	
			});		
		},

		/**
		 * Formats the GeoJSON file by flattening the objects in the features array for easier sorting.
		 * @param  {string} id The id of the GeoJSON data in the database.
		 */
		formatGeoJSON: function(id){
			var data = [];
			_.database[id].features.forEach(function(feature){
				var featureData = {
					id: feature.id,
					geometry: feature.geometry
				};

				Object.keys(feature.properties).forEach(function(key){
					var safeKey = (Number.isInteger(parseInt(key))) ? 'n' + key : key; //This is done for keys that are numbers so they can be added to the template.
					featureData[safeKey] = (feature.properties[key]) ? feature.properties[key] : 0;
				});
				data.push(featureData);
			});
			_.database[id] = data;
		},

		/**
		 * Sorts a database entry by value of a given key.
		 * @param {string} id The id of the database object.
		 * @param  {string} key     The name of the key.
		 * @param  {boolean} reverse (optional) TRUE if the sort should be reversed, FALSE or unspecified otherwise.
		 */
		sortByKey: function(id, key, reverse){
			_.database[id].sort(function(a, b){
				var key1 = (!isNaN(parseFloat(a[key])) && isFinite(a[key])) ? Number(a[key]) : a[key];
				var key2 = (!isNaN(parseFloat(b[key])) && isFinite(b[key])) ? Number(b[key]) : b[key];
				return (key1 > key2) ? 1 : (key1 < key2) ? -1 : 0;
			});
			_.database[id] = (reverse) ? _.database[id].reverse() : _.database[id];
		},

		getViewBoxCoordinates: function(city){
			var minX = 0, maxX = 0, minY = 0, maxY = 0;

			_.database[city].forEach(function(neigborhood){
				neigborhood.geometry.coordinates[0].forEach(function(coordinates){
					var posX = coordinates[0];
					var posY = coordinates[1];
					minX = ((posX < minX) || (minX === 0)) ? posX : minX;
					maxX = ((posX > maxX) || (maxX === 0)) ? posX : maxX;
					minY = ((posY < minY) || (minY === 0)) ? posY : minY;
					maxY = ((posY > maxY) || (maxY === 0)) ? posY : maxY;
				});
			});

			return [minX, minY, maxX - minX, maxY - minY].join(' ');
		}		
	}
};