/**
* @author Benjamin Kuker
* @description: Replaces all select form elements.
*/
var SelectReplace = {

	/**
	 * Class names for styling various parts of the replacement select.
	 * @type {Object}
	 */
	options: {
		activeClass: 'active',
		activeLiClass: 'activeLi',
		containerClass: 'selectContainer',
		displayClass: 'display',
		expandedClass: 'expanded',
		liClass: 'selectLi',
		listClass: 'selectList',
		optgroupClass: 'selectOptgroup',
		triggerActiveHtml: '&#9650;',
		triggerClass: 'trigger',
		triggerInactiveHtml: '&#9660;'
	},

	/**
	 * Initializes the select replacement and replaces all select elements on the page without further interaction.
	 */
	initialize: function(){
		this.selects = Array.prototype.slice.call(document.getElementsByTagName('select'));;
		this.triggers = [];
		this.lists = [];
		this.listOptions = [];
		this.selects.forEach(function(select, index){
			this.setListOptions(select, index);
			this.createTrigger(select, index);
			this.createList(select, index);
			this.addNavigation(index);
			select.style.display = 'none';
		}.bind(this));

		//Create events
		this.focus = document.createEvent('Event');
		this.focus.initEvent('focus', true, true);
		this.blur = document.createEvent('Event');
		this.blur.initEvent('blur', true, true);
		this.change = document.createEvent('Event');
		this.change.initEvent('change', true, true);				
	},

	/**
	 * Sets the list options for the replacement dropdown list.
	 * @param {HTMLObject} select The original select.
	 * @param {int} index  The select index.
	 */
	setListOptions: function(select, index){
		var self = this;
		this.listOptions[index] = [];
		select.childNodes.forEach(function(child, key){
			if (['OPTGROUP', 'OPTION'].indexOf(child.tagName) > -1){
				this.listOptions[index][key] = {'text': child.text, 'value': child.value};
				if (child.tagName == 'OPTGROUP'){
					this.listOptions[index][key]['text'] = child.getAttribute('label');
					this.listOptions[index][key]['value'] = [];
					child.childNodes.forEach(function(option, subkey){
						self.listOptions[index][key]['value'][subkey] = {'text': option.text, 'value': option.value};
					});
				}				
			}
		}.bind(this));
	},
	
	/**
	 * Creates the visible replacement for the select and assigns event listeners.
	 * @param  {HTMLObject} select The original select.
	 * @param  {int} index  The select index.
	 */
	createTrigger: function(select, index){
		var self = this;
		var replaceId = (select.id) ? select.id + 'Replace' : select.getAttribute('name') + 'Replace';
		var display = document.createElement('span');
		display.classList.add(this.options.displayClass);
		display.innerHTML = select.options[select.selectedIndex].text;

		var trigger = document.createElement('span');
		trigger.classList.add(this.options.triggerClass);
		trigger.innerHTML = self.options.triggerInactiveHtml;

		this.triggers[index] = document.createElement('a');
		this.triggers[index].id = replaceId;
		this.triggers[index].classList.add(self.options.containerClass);
		this.triggers[index].setAttribute('name', select.getAttribute('name'));
		this.triggers[index].setAttribute('tabindex', 0);
		this.triggers[index].addEventListener('click', function(){
			(self.lists[index].style.display === 'block') ? self.collapseList(index) :	self.expandList(index);
		});
		this.triggers[index].addEventListener('focus', function(){
			this.classList.add(self.options.activeClass);
			select.dispatchEvent(self.focus);
		});
		this.triggers[index].addEventListener('blur', function(){
			this.classList.remove(self.options.activeClass);
			select.dispatchEvent(self.blur);
		});		
		this.triggers[index].appendChild(display);
		this.triggers[index].appendChild(trigger);

		if ((!select.nextSibling) || (select.nextSibling.name !== select.getAttribute('name'))){ //Prevents duplication
			select.parentNode.insertBefore(this.triggers[index], select.nextSibling);
		}
	},
	
	/**
	 * Adds list options dynamically.
	 * @param array - listOptions - An array of options to append to the current options in the dropdown list
	 */
	append: function(listOptions){
		this.listOptions.push(listOptions);
		this.deleteList();
		this.createList();
	},

	/**
	 * Removes specific list options.
	 * @param array - listOptions - An array of options to remove from the current options in the dropdown list
	 */
	remove: function(listOptions){
		var self = this;
		listOptions.forEach(function(item){		
			self.listOptions.splice(self.listOptions.indexOf(item), 1);
		});
		this.deleteList();
		this.createList();
	},	
	
	/**
	 * Replaces the list options dynamically.
	 * @param array - listOptions - An array of options to replace the current options in the dropdown list
	 */
	replace: function(listOptions){
		this.listOptions = listOptions;
		this.deleteList();
		this.createList();
	},
	
	/**
	 * Creates the dropdown list for the replacement select.
	 * @param  {HTMLObject} select The original select.
	 * @param  {int} index  The select index.
	 */
	createList: function(select, index){
		var self = this;
		var name = (select.id) ? select.id + 'ReplaceList' : select.getAttribute('name') + 'ReplaceList';
		
		this.lists[index] = document.createElement('ul');
		this.lists[index].setAttribute('data-name', name);
		this.lists[index].classList.add(self.options.listClass);
		this.lists[index].style['max-height'] = 300;
		this.lists[index].style['overflow'] = 'auto';
		this.lists[index].style['position'] = 'absolute';
		this.lists[index].style['z-index'] = 1000;

		if (select.nextSibling.getAttribute('data-name') !== this.lists[index].getAttribute('data-name')){ //Prevents duplication
			select.parentNode.insertBefore(this.lists[index], select.nextSibling);
		}		

		this.createListOptions(index);
		this.triggers[index].querySelectorAll('.' + this.options.displayClass).forEach(function(item){
			item.style['min-width'] = self.lists[index].getBoundingClientRect().width;
		});
		this.lists[index].style.display = 'none';
		
		document.addEventListener('click', function(e){
			if ((!e.target.classList.contains(self.options.triggerClass)) && (!e.target.classList.contains(self.options.displayClass))){
				self.collapseList(index);
			}
		});		
	},
	
	/**
	 * Creates and appends the list options for the dropdown replacement list.
	 * @param  {int} index The select index.
	 */
	createListOptions: function(index){
		this.listOptions[index].forEach(function(item){
			if (typeof(item['value']) === 'array'){
				var optgroup = this.createOptgroup(index, item.text, item.value);
				this.lists[index].appendChild(optgroup);				
			} else {
				var option = this.createListItem(index, item.text, item.value);
				this.lists[index].appendChild(option);	
			}
		}, this);
	},

	/**
	 * Creates a list item for the replacement select dropdown list from an optgroup.
	 * @param  {int} index The select index.
	 * @param  {string} text  The optgroup text.
	 * @param  {array} values The options.
	 * @return {HTMLObject}       The compiled list optgroup item.
	 */
	createOptgroup: function(index, text, values){
		var label = document.createElement('span');
		label.text = text;
		var optgroupList = document.createElement('ul');
		
		values.forEach(function(item){
			var option = this.createListItem(index, item['text'], item['value'])
			optgroupList.appendChild(option);
		}, this);
		
		var li = document.createElement('li');
		li.classList.add(this.options.optgroupClass);
		li.appendChild(label);
		li.appendChild(optgroupList);

		return li;
	},

	/**
	 * Creates a list item for the replacement select dropdown list.
	 * @param  {int} index The select index.
	 * @param  {string} text  The option text.
	 * @param  {string} value The option value.
	 * @return {HTMLObject}       The compiled list item.
	 */
	createListItem: function(index, text, value){
		var self = this;
		var selectedText = this.selects[index].options[this.selects[index].selectedIndex].text;
		
		var liItem = document.createElement('li');
		liItem.classList.add(self.options.liClass);
		liItem.classList.add(text.substring(0, 1).toLowerCase());
		if (text === selectedText){
			liItem.classList.add(self.options.activeLiClass);
		}
		liItem.setAttribute('data-value', value);
		liItem.innerHTML = text;
		
		liItem.addEventListener('click', function(e){
			var text = e.target.innerHTML;
			self.lists[index].querySelectorAll('li').forEach(function(item){
				item.classList.remove(self.options.activeLiClass);
			});
			e.target.classList.add(self.options.activeLiClass);						
			self.triggers[index].querySelectorAll('.' + self.options.displayClass).forEach(function(item){
				item.innerHTML = text;
			});
			self.collapseList(index);
			self.updateSelect(index, text);
		});

		return liItem;
	},

	/**
	 * Updates the original hidden select and triggers the change event.
	 * @param {int} index The select index.
	 * @param {string} selectedText The new text value of the select.
	 */
	updateSelect: function(index, selectedText){
		this.selects[index].querySelectorAll('option').forEach(function(el){
			if (el.text === selectedText){
				el.setAttribute('selected', true);
			} else {
				el.setAttribute('selected', false);
			}
			this.selects[index].dispatchEvent(this.change);
		}.bind(this));
	},

	/**
	 * Removes the list from the DOM.
	 */	
	deleteList: function(){
		this.list.parentNode.removeChild(this.list);
	},

	/**
	 * Expands the dropdown options list.
	 * @param {int} index The select index.
	 */
	expandList: function(index){
		var dimensions = this.triggers[index].getBoundingClientRect();

		this.lists[index].style.display = 'block';
		this.lists[index].style.left = dimensions.left + 'px';
		this.lists[index].style.top = dimensions.bottom + 'px';
		this.lists[index].style['min-width'] = dimensions.width + 'px';

		var listBottom = dimensions.bottom + this.lists[index].getBoundingClientRect().y;
		var listTop = dimensions.top - this.lists[index].getBoundingClientRect().y;

		if ((listBottom > (window.innerHeight + window.scrollY)) && (listTop > window.scrollY)){
			this.lists[index].style.top = dimensions.top - this.lists[index].getBoundingClientRect().y + 2;
			this.lists[index].classList.remove('down');
			this.lists[index].classList.remove('up');
			var direction = 'up';
		} else {
			this.lists[index].style.top = dimensions.bottom -2;
			this.lists[index].classList.remove('up');
			this.lists[index].classList.remove('down');
			var direction = 'down';
		}
		this.triggers[index].querySelectorAll('.' + this.options.triggerClass).forEach(function(item){
			item.innerHTML = this.options.triggerActiveHtml;
		}.bind(this));
		this.triggers[index].classList.add(this.options.expandedClass);
		this.triggers[index].classList.remove('up');
		this.triggers[index].classList.remove('down');
		this.triggers[index].classList.add(direction);
	},

	/**
	 * Collapses the dropdown options list.
	 * @param {int} index The select index.
	 */	
	collapseList: function(index){
		this.lists[index].style.display = 'none';
		this.triggers[index].querySelectorAll('.' + this.options.triggerClass).forEach(function(item){
			item.innerHTML = this.options.triggerInactiveHtml;
		}.bind(this));
		this.triggers[index].classList.remove(this.options.expandedClass);	
	},

	/**
	 * Initial handling for keyboard navigation.
	 * @param {int} index The select index.
	 */
	addNavigation: function(index){
		var self = this;
		this.triggers[index].addEventListener('keydown', function(e){
			if (e.keyCode === 9){ //Tab
				self.collapseList(index);
			}
			self.addSelectionEvents(e, index);			
		});
	},

	/**
	 * Handles keyboard events and interaction with the replacement select object.
	 * @param {Event} e     The keyboard event.
	 * @param {int} index The select index.
	 */
	addSelectionEvents: function(e, index){
		var expanded = e.target.classList.contains('expanded');
		var toggleKeys = [13, 32]; //Enter and space.
		var forwardKeys = [39, 40]; //Right and down arrows.
		var backwardKeys = [37, 38]; //Left and up arrows.

		var self = this;
		var list = this.lists[index];
		var selectedIndex = 0;
		var options = list.querySelectorAll('li');

		options.forEach(function(option, index){
			selectedIndex = (option.classList.contains(self.options.activeLiClass)) ? index : selectedIndex;
		});

		if (toggleKeys.indexOf(e.keyCode) > -1){
			e.stopPropagation();
			e.preventDefault();

			if (expanded){
				var newSelection = options[selectedIndex].innerHTML;
				this.collapseList(index);
				self.updateSelect(index, newSelection);
				e.target.querySelectorAll('.display')[0].innerHTML = newSelection;
			} else {
				this.expandList(index);
			}
		} else if (forwardKeys.indexOf(e.keyCode) > -1){
			e.stopPropagation();
			e.preventDefault();
			var nextIndex = selectedIndex + 1;
			
			if (nextIndex < options.length){
				options[selectedIndex].classList.remove(self.options.activeLiClass);
				options[nextIndex].classList.add(self.options.activeLiClass);
			}
		} else if (backwardKeys.indexOf(e.keyCode) > -1){
			e.stopPropagation();
			e.preventDefault();
			var nextIndex = selectedIndex - 1;

			if (nextIndex >= 0){
				options[selectedIndex].classList.remove(self.options.activeLiClass);
				options[nextIndex].classList.add(self.options.activeLiClass);
			}			
		}
		
	}
};