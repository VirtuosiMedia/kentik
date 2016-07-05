/**
 * @author Benjamin Kuker
 * @description: Creates autocomplete for input fields.
 */
var Autocomplete = {

	event: null,

	/**
	 * The initialize function only needs to be called once for a given autocomplete element.
	 * @param string - id - The id for the autocomplete input
	 */
	initialize: function(id){
		this.event = document.createEvent('Event');
		this.event.initEvent('completed', true, true);
		var input = document.getElementById(id);
		var self = this;
		
		input.addEventListener('focus', function(e){self.createDropdown(input)});
		input.addEventListener('blur', function(){
			self.removePrompt();
			setTimeout(function(){
				self.removeList(input);
			}, 200);
		});
		input.addEventListener('keyup', function(e){self.updateList(e, input);});
		input.addEventListener('keydown', function(e){	
			if (['Up', 'Down', 'ArrowUp', 'ArrowDown', 'Enter'].indexOf(e.key) > -1){
				e.stopPropagation();
			}
		});
		input.setAttribute('autocomplete', 'off');
	},

	/**
	 * Creates the dropdown list of options for the autocomplete input.
	 * @param  {HTMLObject} input The original input.
	 */
	createDropdown: function(input){
		this.removePrompt();

		if (input.value.trim().length >= 1){
			var list = this.getList(input);
			var options = Array.prototype.slice.call(list.getElementsByTagName('li'));
			var self = this;
			
			if (options.length > 0){
				var dim = input.getBoundingClientRect();
				this.removePrompt();
				list.setAttribute('style', 'top: ' + dim.bottom + 'px; width: ' +  dim.width + 'px; left: ' + dim.left + 'px;')
				input.parentNode.insertBefore(list, input.nextSibling);

				options.forEach(function(option){
					option.addEventListener('click', function(){
						input.set('value', this.getData('item'));
						self.removeList(input);
						input.focus();
						input.dispatchEvent('completed');
					});
				});
			} else {
				this.createPrompt(input, 'No results found');
			}			
		} 
	},

	/**
	 * Creates a custom prompt that can be triggered under certain conditions.
	 * @param  {HTMLObject} input The autocomplete input element.
	 * @param  {string} message The prompt message.
	 */
	createPrompt: function(input, message){
		this.removePrompt();
		var dim = input.getBoundingClientRect();
		var prompt = document.createElement('span');
		prompt.classList.add('autocompletePrompt');
		prompt.text = message;
		prompt.styles = 'top:' + dim.bottom + 'px; width:' + dim.width + 'px; left:' + dim.left + 'px;';
		input.parentNode.insertBefore(prompt, input.nextSibling);
	},

	/**
	 * Removes the prompt from the DOM.
	 */
	removePrompt: function(){
		document.querySelectorAll('.autocompletePrompt').forEach(function(el){
			el.parentNode.removeChild(el);
		});
	},

	/**
	 * Retrieves the autocomplete data from the input's data-options attribute. Each option should be comma separated.
	 * @param  {HTMLObject} input The autocomplete input element.
	 * @return {HTMLObject}        The compiled autocomplete dropdown list.
	 */
	getList: function(input){
		var text = input.value.trim();
		var list = input.getAttribute('data-options');

		return this.createListFromCSV(list, text);
	},

	/**
	 * Creates the autocomplete dropdown list from a CSV string.
	 * @param  {string} values The CSV string of options.
	 * @param  {string} query  The autocomplete query.
	 * @return {HTMLObject}        The compiled autocomplete dropdown list.
	 */
	createListFromCSV: function(values, query){
		values = values.split(',').filter(function(value){
			return (value.toLowerCase().indexOf(query.toLowerCase()) > -1);
		});

		values.sort();
		values = values.slice(0, 10); //Limit to 10
		
		var list = document.createElement('ul');
		list.classList.add('autocompleteList');
				
		values.forEach(function(value){
			value = value.trim();
			query = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
			var regex = new RegExp('(' + query + ')', 'gi');
			
			var li = document.createElement('li');
			li.setAttribute('data-item', value); 
			li.innerHTML = value.replace(regex, "<strong>$1</strong>");
			list.appendChild(li);
		});
		return list;
	},

	/**
	 * Updates the autocomplete dropdown list after keyboard interaction.
	 * @param  {Event} event The keyboard event.
	 * @param  {HTMLObject} input The autocomplete input element.
	 */
	updateList: function(event, input){
		if (['Up', 'Down', 'ArrowUp', 'ArrowDown'].indexOf(event.key) > -1){
			event.stopPropagation();
			this.setNextOption(event.key, input);
		} else if (event.key == 'Enter'){
			event.stopPropagation();
			var list = input.nextSibling;
			if (list){
				var currentOption = this.getCurrentOption(input);
				var options = Array.prototype.slice.call(list.getElementsByTagName('li'));
				input.value = options[currentOption].getAttribute('data-item');
				this.removeList(input);
			}
			input.dispatchEvent(this.event);
		} else {
			this.removeList(input);
			this.createDropdown(input);
		}		
	},

	/**
	 * Retrieves the current selected option from the autocomplete dropdown list.
	 * @param  {HTMLObject} input The autocomplete input element.
	 */
	getCurrentOption: function(input){
		var options = Array.prototype.slice.call(input.nextSibling.getElementsByTagName('li'));
		var current = -1;
		options.forEach(function(option, index){
			current = (option.classList.contains('active')) ? index : current;
		});
		return current;
	},

	/**
	 * Handles keyboard input for selecting the next option from the autocomplete dropdown list.
	 * @param {'string'} key The name of the key that was pressed.
	 * @param  {HTMLObject} input The autocomplete input element.
	 */
	setNextOption: function(key, input){
		if (input.nextSibling){
			var options = Array.prototype.slice.call(input.nextSibling.getElementsByTagName('li'));
			var numOptions = options.length - 1;
			var currentOption = this.getCurrentOption(input);
							
			if (['Down', 'ArrowDown'].indexOf(key) > -1){
				var nextOption = ((currentOption + 1) <= numOptions) ? currentOption + 1 : currentOption;
			} else {
				var nextOption = ((currentOption - 1) >= 0) ? currentOption - 1 : null;
			}
	
			options.forEach(function(option){
				option.classList.remove('active');
			});
			if (nextOption != null){
				options[nextOption].classList.add('active');
			}
		}
	},

	/**
	 * Removes the autocomplete dropdown list from the DOM.
	 * @param  {HTMLObject} input The autocomplete input element.
	 */	
	removeList: function(input){
		var list = input.nextSibling;
		if (list){
			list.parentNode.removeChild(list);
		}
	}
};