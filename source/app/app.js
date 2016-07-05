/**
* @author Benjamin Kuker
* @description: A sample application for a Kentik interview to display impaired crash data in Washington D.C..
*/
var app = {

	settings: {
		city: 'washingtonDC', 		//The city is set up to be dynamic. D.C. isn't hard-coded.
		cycle: false,				//The neighborhood autocycle toggle.
		cycleData: null,			//A cloned array of the neighborhood data, sorted by name.
		cycleIndex: 0,				//The current index of the autocycle.
		cycleTimer: null,			//The autocycle function.
		display: 'table',			//The current display view.
		query: '',					//The last query.
		selectedNeighborhood: -1,	//The inded of the current selected neighborhood on the map.
		sort: 'name',				//The table sort column.
		sortAsc: false,				//The table sort direction.
		year: 'total'				//The year filter selection.
	},

	/**
	 * Initializes the application.
	 */
	initialize: function(){
		var self = this;
		this.delegateEvents();

		_.data.load(this.settings.city, 'data/data.geojson').then(function(){
			_.data.formatGeoJSON(self.settings.city);

			self.render();
			self.createDatalist();
		});
	},

	/**
	 * Adds delegated event listeners for elements that may not yet be on the page.
	 */
	delegateEvents: function(){
		['click', 'keyup', 'input', 'change', 'completed'].forEach(function(eventName){
			document.body.addEventListener(eventName, function(e){
				var callback = e.target.getAttribute('data-' + eventName);
				if (callback){
					app[callback](e, e.target);
				}
			});			
		});		
	},

	/**
	 * Preps data for the autocomplete neighborhood search and instantiates it.
	 */
	createDatalist: function(){
		var options = [];

		_.database[this.settings.city].forEach(function(neighborhood){
			options.push(neighborhood.name);
		});

		var datalist = document.getElementById('nameFilter');
		datalist.setAttribute('data-options', options.join(','));

		Autocomplete.initialize('nameFilter');
		SelectReplace.initialize();
		document.getElementById('cityReplace').focus();
	},

	/**
	 * Processes the neighborhood search query for both the table and map views.
	 * @param  {Event} e      The event object for the search.
	 */
	search: function(e){
		this.stopCycle();
		if ([37, 38, 39, 40].indexOf(e.keyCode) < 0){ //Prevent interference with arrow keys
			if (this.settings.display === 'map'){
				document.querySelectorAll('.neighborhood').forEach(function(el){
					el.classList.remove('selected');
				});
			}

			var query = document.getElementById('nameFilter').value.trim();
			if ((query.length > 0) || (query !== this.settings.query)){
				if (this.settings.display === 'table'){
					this.render();
					this.settings.selectedNeighborhood = -1;
				} else {
					this.highlightNeighborhood(query);
				}
				this.settings.query = query;
			}
		}
	},

	/**
	 * Changes the page display view.
	 * @param  {Event} e      The event object for the view change.
	 * @param  {HTMLObject} target The trigger element.
	 */
	changeView: function(e, target){
		var display = target.getAttribute('data-view');

		if (this.settings.display !== display){
			this.settings.display = display;
			this.render();
		}
	},

	/**
	 * Sorts the table by the selected column.
	 * @param  {Event} e      The event object for the sort.
	 * @param  {HTMLObject} target The table column trigger element.
	 */
	sort: function(e, target){
		if (this.settings.sort === target.id){
			this.settings.sortAsc = (this.settings.sortAsc) ? false : true;
		}

		this.settings.sort = target.id;
		
		_.data.sortByKey(this.settings.city, this.settings.sort, this.settings.sortAsc);
		this.render();
		document.getElementById(this.settings.sort).focus();
	},

	/**
	 * Changes the year and then filters the map data by the selection via a rerender.
	 * @param  {Event} e      The event object for the year filter.
	 * @param  {HTMLObject} target The year filter trigger element.
	 */
	changeYear: function(e, target){
		this.settings.year = target.id;
		document.querySelectorAll('#yearList button').forEach(function(el){
			el.classList.remove('selected');
		});
		document.getElementById(this.settings.year).classList.add('selected');
		this.renderMap();
		this.rememberHighlights();
	},

	/**
	 * Toggles the neighborhood autocycle on and off depending on the current state.
	 */
	toggleCycle: function(){
		if (this.settings.cycle){
			this.stopCycle();
		} else {
			_.data.sortByKey(this.settings.city, 'name');
			this.settings.cycleData = _.database[this.settings.city].slice(0); //Clone
			_.data.sortByKey(this.settings.city, 'id');
			this.settings.cycle = true;
			document.getElementById('cycle').classList.add('selected');

			var cycle = function(){
				var neighborhoods = app.settings.cycleData;
				app.renderNeighborhood(null, null, neighborhoods[app.settings.cycleIndex].id);
				app.settings.cycleIndex = ((app.settings.cycleIndex + 1) >= neighborhoods.length) ? 0 : app.settings.cycleIndex + 1;
			};

			cycle();

			this.cycleTimer = setInterval(cycle, 5000);
		}
	},

	/**
	 * Stops the neighborhood autocycle function. If the view is switch, the cycleIndex will be reset to 0.
	 */
	stopCycle: function(){
		this.settings.cycle = false;
		clearInterval(this.cycleTimer);

		if (this.settings.display === 'table'){ //Only reset if the view changes.
			this.settings.cycleIndex = 0;
		}

		var cycle = document.getElementById('cycle');
		if (cycle){
			cycle.classList.remove('selected');			
		}
	},

	/**
	 * Highlights one or more neighborhoods on the map that match the search query string.
	 * @param  {string} query The search query.
	 */
	highlightNeighborhood: function(query){
		var highlighted = [];
		query = query.toLocaleLowerCase().trim();

		_.database[this.settings.city].forEach(function(neighborhood){
			if ((neighborhood.name.toLocaleLowerCase().indexOf(query) > -1) && (query !== '')){
				highlighted.push(neighborhood.id);
				document.getElementById('path' + neighborhood.id).classList.add('selected');
			}
		});

		if (highlighted.length === 1){
			this.settings.selectedNeighborhood = highlighted[0];
			this.renderNeighborhood(null, null, highlighted[0]);
		} else {
			this.settings.selectedNeighborhood = -1;
			document.getElementById('neighborhoodDetail').innerHTML = '';
		}
	},

	/**
	 * Provides persistance for the neighborhood map highlights when switch between views.
	 */
	rememberHighlights: function(){
		var query = document.getElementById('nameFilter').value.trim();
		if (query.length > 0){ //Carry over map highlights on searches.
			setTimeout(function(){ //The delay helps fix a race condition for the map rendering in the DOM.
				this.highlightNeighborhood(query);
			}.bind(this), 200);				
		} else { //Remember the selection
			var selected = this.settings.selectedNeighborhood;
			if (selected >= 0){		
				setTimeout(function(){ //The delay helps fix a race condition for the map rendering in the DOM.
					document.getElementById('path' + selected).classList.add('selected');
					this.renderNeighborhood(false, false, selected);
				}.bind(this), 200);
				document.getElementById('nameFilter').value = '';
			}			
		}		
	},

	/**
	 * Creates tooltips for neighborhoods on the map on hover or via keyboard navigation.
	 * @param  {int} id The neighborhood id.
	 */
	createTooltip: function(id){
		var position = document.getElementById('path' + id).getBoundingClientRect();
		var tooltip = document.createElement('div');
		tooltip.classList.add('tooltip');
		tooltip.setAttribute('style', 'top: ' + (position.top - 48) + 'px; left:' + position.left + 'px;');

		var title = document.createElement('span');
		title.innerHTML = _.database[this.settings.city][id].name + ':';

		var crashes = document.createElement('span');
		crashes.innerHTML = _.database[this.settings.city][id][this.settings.year];

		title.appendChild(crashes);
		tooltip.appendChild(title);

		document.body.appendChild(tooltip);
	},

	/**
	 * Removes the tooltips from the DOM.
	 */
	destroyTooltip: function(){
		document.querySelectorAll('.tooltip').forEach(function(tip){
			document.body.removeChild(tip);
		});
	},

	/**
	 * A recursive function to provide a smooth scroll animated effect.
	 * @param  {int} duration The number of milliseconds remaining in the animation.
	 */
	scroll: function(duration){
		duration = (typeof(duration) === 'object') ? 500 : duration;

		if (duration <= 0){
			return;
		} else {
			var distance = 0 - document.body.scrollTop;
			var travel = distance/duration * 10;

			setTimeout(function(){
				document.body.scrollTop += travel;
				if (document.body.scrollTop === 0){
					return;
				} else {
					app.scroll(duration - 10);
				}
			})
		}
	},

	/**
	 * The master view render function.
	 */
	render: function(){
		if (this.settings.display == 'table'){
			this.renderTableView();
		} else {
			this.renderMapView();
		}

		document.querySelectorAll('.displayButton').forEach(function(el){
			el.classList.remove('selected');
		});		
		document.getElementById(this.settings.display + 'Button').classList.add('selected');
	},

	/**
	 * Loads the table templates, populates them, and renders them as a view.
	 */
	renderTableView: function(){
		this.stopCycle();

		_.data.sortByKey(this.settings.city, this.settings.sort, this.settings.sortAsc);
		var name = document.getElementById('nameFilter');
		var filter = name.value.toLocaleLowerCase();
		var rows = document.createDocumentFragment();
		var delay = 0;

		_.database[this.settings.city].forEach(function(neighborhood){
			if ((neighborhood.name.toLocaleLowerCase().indexOf(filter) > -1) || (!filter)){
				var row = _.template('crashTableRow');
				var tr = document.createElement('tr');

				tr.innerHTML = row.populate(neighborhood).render();
				tr.setAttribute('style', 'animation-delay: ' + delay + 'ms');
				rows.appendChild(tr);
				delay += 10;
			}
		});

		var tbody = document.createElement('tbody');
		tbody.appendChild(rows);

		var table = _.template('crashTable');
		table.populate({tbody: tbody.innerHTML}).render('content');

		var sortClass = (this.settings.sortAsc) ? 'sortAsc' : 'sortDesc';
		document.getElementById(this.settings.sort).setAttribute('class', sortClass);
	},

	/**
	 * The master map view render function.
	 */
	renderMapView: function(){
		var template = _.template('mapView').render('content');
		document.getElementById(this.settings.year).classList.add('selected');
		document.getElementById('nameFilter').setAttribute('list', 'neighborhoodNames');

		this.renderMap();
		this.rememberHighlights();
	},

	/**
	 * Generates the SVG map from the neighborhood data and renders it on the page.
	 */
	renderMap: function(){
		var city = this.settings.city;
		var year = this.settings.year;
		var self = this;
		_.data.sortByKey(city, 'id');
		
		var svg = d3.select('#map').html("").append('svg').attr({
			'xmlns': 'http://www.w3.org/2000/svg',
			'version': '1.1',
			'viewBox': _.data.getViewBoxCoordinates(city)
		});

		var path = d3.geo.path().projection(null);
		
		d3.json('data/data.topojson', function(error, municipality){
			if (error) throw error;

			var neighborhoods = topojson.feature(municipality, municipality.objects.collection).features;
			neighborhoods.map(function(d){ 
				return d.properties.crashes = _.database[city][d.id][year]; 
			}).sort(function(a, b){return a - b;});

			svg.append('g').selectAll('path').data(neighborhoods).enter().append('a').attr({
				'xlink:href': '#',
				'id': function(d){return 'link' + d.id;},
			}).on('focus', function(item, id){
				self.createTooltip(id);
			}).on('blur', function(item, id){
				self.destroyTooltip();
			}).on('click', function(item, id){
				self.renderNeighborhood(false, false, id);
			}).append('path').attr({
				'id': function(d){return 'path' + d.id;},
				'data-click': 'renderNeighborhood',
				'class': 'neighborhood',
				'd': path,
				'tabindex': ''
			}).style({
				'fill-opacity': function(d){ return (d.properties.crashes/100) * d.properties.crashes + 0.2;},
				'animation-delay': function(d){ return (d.id * 1.5) + 'ms';}
			}).on('mouseover', function(item, id){
				self.createTooltip(id);
			}).on('mouseout', function(){
				self.destroyTooltip();
			})		      
		});
	},

	/**
	 * Renders the neighborhood chart view.
	 * @param  {Event} e      (optional) The HTML event object.
	 * @param  {SVGObject} target (optional) The SVG neighborhood that acted as a trigger.
	 * @param  {int} id     (optional) The id of the neighborhood. If id is used, pass null to the first 2 parameters.
	 */
	renderNeighborhood: function(e, target, id){
		if (e){ //Indicates a click event, overriding the search input and thus clearing it.
			document.getElementById('nameFilter').value = '';
			this.stopCycle();
		}

		target = (target) ? target : document.getElementById('path' + id);

		document.querySelectorAll('.neighborhood').forEach(function(el){
			el.classList.remove('selected');
		});
		target.classList.add('selected');
		
		var index = parseInt(target.id.replace('path', ''));
		var neighborhood = _.database[this.settings.city][index];
		var max = Math.max(neighborhood.n2010, neighborhood.n2011, neighborhood.n2012, neighborhood.n2013, neighborhood.n2014);

		for (var i = 2010; i <= 2014; i++){
			neighborhood['height' + i] = neighborhood['n' + i]/max * 100;
			neighborhood['bar' + i] = (['total', 'n' + i].indexOf(this.settings.year) > -1) ? 'selected' : '';
		}

		var template = _.template('neighborhoodDetailView');
		template.populate(neighborhood).render('neighborhoodDetail');

		this.settings.selectedNeighborhood = index;
	}
};