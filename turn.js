document.addEventListener("DOMContentLoaded", function() {

	console.log("[turn.js] ~ Custom JS ready");

	// List of all imported characters and info
	//------------------------------------------------------
	let CharactersList = [];
	let Descriptor = {};

	function arrangeCharactersDataList() {
		let elements = document.querySelectorAll('#fightList .card');
		let arr = [];
		for (let i = 0; i < elements.length; i++) {
			let chosen = CharactersList.find((el) => el.internalName === elements[i].id);
			// if we want to add a order tracking property
			//chosen.order = i
			chosen.outOfCombat = false;
			arr.push(chosen);
		}
		// console.log('arr', arr);
		let outOfCombatElements = document.querySelectorAll('#outList .card');
		for (let i = 0; i < outOfCombatElements.length; i++) {
			let chosen = CharactersList.find((el) => el.internalName === outOfCombatElements[i].id);
			chosen.outOfCombat = true;
			arr.push(chosen);
		}
		CharactersList = arr;
		console.log(CharactersList);
	}
	// sortable.js setup
	//------------------------------------------------------
	const fightList = document.querySelector("#fightList")//.innerHTML;
	const outList = document.querySelector("#outList")//.innerHTML;
	const options = {
		group: {
			name: '.card',
			swapTreshold: 1
		},
		animation: 150,
		onEnd: function (evt) {
			arrangeCharactersDataList();
		}
	};

	let sort1 = null;
	let sort2 = null;

	// Check for duplicate characters function
	//------------------------------------------------------
	function existsInCharactersArray(obj) {
		if (!obj.internalName || CharactersList.length === 0) return false;
		const result = CharactersList.filter(function(o) {
			return o.internalName === obj.internalName;
		})
		if (result.length) {
			console.warn(`Found existing character: ${obj.internalName}: skipping...`);
			return true;
		} else {
			return false;
		}		
	}

	/**
	 * Save the master objects' content to text .json file
	 * @param {string} filename The desired file name
	 */
	function download(filename) {

		// update characters based on current input values
		//--------------------------------------------------
		for (let i = 0; i < CharactersList.length; i++) {
			let ch = CharactersList[i];
			let el = document.querySelector('#'+ch.internalName);
			if (el) {
				for (const [key, value] of Object.entries(ch.gameStats)) {
					CharactersList[i]['gameStats'][key] = parseInt(el.querySelector('input[name='+ key + ']').value);
				}
				CharactersList[i].isReserve = el.querySelector('input[name=isReserve').checked;
			}
			el = document.querySelector('#'+ch.internalName + '_detail');
			if (el) {
				let v = el.querySelector('input[name=conditions]').value;
				if (v) CharactersList[i]['conditions'] = v;
				v = el.querySelector('input[name=skills]').value;
				if (v) CharactersList[i]['skills'] = v;
				v = el.querySelector('input[name=equip]').value;
				if (v) CharactersList[i]['equip'] = v;
			}
		}
		// create file
		//--------------------------------------------------
		var element = document.createElement('a');
		const text = JSON.stringify({
			"characters": CharactersList,
			"descriptor": Descriptor
		}, null, 2);
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('target', '_blank');
		element.setAttribute('download', filename);
  
		element.style.display = 'none';
		document.body.appendChild(element);
  
		element.click();
  
		document.body.removeChild(element);
	}

	/**
	 * Load the file content and populates the sortable
	 * @param {event} Event The file loaded event
	 */
	function loadFile(event) {
		let str = event.target.result;
		let json = JSON.parse(str);
		
		let htmlCardTemplate = 
		`<div class="row g-0 mx-0">
			<div class="col-md-4 p-2 text-center">
				<div class="progress">
					<div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
		  		</div>
				<img src="images/{{image}}" class="img-fluid rounded-start" alt="Icon">
				<div>
					<button type="button" class="btn btn-sm btn-info turnActivate">Turn on me</button>
					<button type="button" class="btn btn-sm btn-danger removeMe">Remove</button>
				</div>
			</div>
			<div class="col-md-8 p-1">
				<div class="card-body p-0">
					<div class="position-relative">
						<h5 class="card-title mb-1"><strong>{{characterName}}</strong></h5>
						<div class="position-absolute top-0 start-50">
							<div class="form-check form-switch">
								<input class="form-check-input" name="isReserve" type="checkbox" id="flexSwitchCheckDefault_{{i}}">
								<label class="form-check-label" for="flexSwitchCheckDefault_{{i}}">Reserve position?</label>
					  		</div>
						</div>
					</div>					
					<div data-stats="{{gameStats}}" class="characterStats p-2 my-2 bg-secondary row mx-0 justify-content-center"></div>
				</div>
			</div>
			<div class="col-md-12 text-center">
				<p class="text-secondary mb-1"><small>(data creazione: {{date}})</small></p>
			</div>
		</div>`;
		if (json.descriptor) {
			Descriptor = json.descriptor;
			// load fight turn number
			if (json.descriptor.turn) {
				document.getElementById('customRange').value = json.descriptor.turn;
				document.getElementById('gameTurn').innerText = json.descriptor.turn;
			}
		}
		//-------------------------------------------------------------
		// Create and populate cards
		//-------------------------------------------------------------
		if (json.characters && json.characters.length) {
			for (let i = 0; i < json.characters.length; i++) {
				const character = json.characters[i];
				// console.log(character);	
				let HtmlCard = htmlCardTemplate; // copy markup

				// adapt template
				HtmlCard = HtmlCard.replace("{{image}}", character.image)
					.replace("{{date}}", Date())
					.replace("{{characterName}}", character.name)
					.replace("{{i}}", i);
				
				let list = character.outOfCombat ? "outList" : "fightList";
				// avoid character duplicates
				if (false === existsInCharactersArray(character) ) {
					// Add to main characters list
					CharactersList.push(character);
					let listContainer = document.querySelector('#' + list);
					let el = document.createElement('div');
					el.className = 'card mb-3 fightCard';
					el.id = character.internalName;
					el.innerHTML = HtmlCard;
					listContainer.appendChild(el);
					let statsHtml = el.querySelector('.characterStats');
					statsHtml.dataset.stats = JSON.stringify(character.gameStats);
					// add input fields for every stat
					for (const [key, value] of Object.entries(character.gameStats)) {
						let div = document.createElement('div');
						div.className = 'input-group input-group-sm my-1 col-4 px-1';
						let fieldType = (typeof value === 'number') ? 'number': 'text';// ${key}${fieldType}
						statsHtml.appendChild(div);
						div.innerHTML  = '<span class="input-group-text">'+ key +'</span><input type="'+ 
							fieldType +'" class="form-control" value="'+ value +'" name="'+ key +'">';
					}
					el.querySelector('input[name=isReserve').checked = character.isReserve;
				}
			}
			console.log(CharactersList, 'CharactersList')
		}

		updateLiveControls();
		updateDetails();

		let lives = document.querySelectorAll("body input[name=PV]");
		console.log("lives", lives);
		lives.forEach( element => element.dispatchEvent(new Event('input')))
		//------------------------------------------------
		// Update Sortables
		//------------------------------------------------
		sort1 = new Sortable(fightList, options);
		sort2 = new Sortable(outList, options);

	}

	let file = document.querySelector('#fileInput');
	document.getElementById('jsonForm').addEventListener('submit', function(event) {
		event.preventDefault();
		console.log('Loading Json encounter', file.value.length);
		console.log(file.value);
		// If there's no file, do nothing
		if (!file.value.length) return;

		// Create a new FileReader() object
		let reader = new FileReader();

		// Setup the callback event to run when the file is read
		reader.onload = loadFile;

		// Read the file
		reader.readAsText(file.files[0]);
	});
	document.getElementById('jsonSave').addEventListener("click", function(event) {
		download('saved-encounter.json');
	});
	document.getElementById('customRange').addEventListener("input", function(event) {
		document.getElementById('gameTurn').innerText = this.value;
		Descriptor.turn = this.value;
	})

	// Update Live Controls
	//------------------------------------------------------
	function updateLiveControls() {
		let lives = document.querySelectorAll("body input[name=PV]");
		console.log("lives", lives);
		lives.forEach(element => {
			element.removeEventListener('input', function(){});
			element.addEventListener("input", function(ev) {
				// console.log('update health');
				// console.log(this.value)
				let current = this.value;
				let maximum = this.closest('div.characterStats').querySelector('input[name=PvMAX]').value;
				let percentage = 100 * parseInt(current) / parseInt(maximum);
				let color = '';
				if (percentage >= 101) {
					color = 'info'
				} else if (percentage >= 67) {
					color = 'success'
				} else if (percentage >= 34) {
					color = 'warning'
				} else {
					color = 'danger'
				}
				let bar = this.closest('.card').querySelector('.progress-bar');
				bar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-' + color;
				bar.style.width = parseInt(percentage) + '%';
			});
		});

		let buttons = document.querySelectorAll('.card button');
		buttons.forEach(element => {
			element.removeEventListener("click", function(){});
			element.addEventListener("click", function(ev) {
				// console.log(this.classList);
				if (this.classList.contains('turnActivate')) {
					let toggling = this.closest('.card').classList.contains('bg-warning');
					let items = document.getElementsByClassName('card');
					for (let i=0; i < items.length; i++) {
						items[i].classList.remove('bg-warning')
					}					
					if (!toggling) {
						this.closest('.card').classList.add('bg-warning')
					} 
					else {
						this.closest('.card').classList.remove('bg-warning')
					};
				} else if (this.classList.contains('removeMe')) {
					let id = this.closest('.card').id;
					if (true == confirm('Are you sure?')) {
						this.closest('.card').remove();
						for (var i = CharactersList.length - 1; i >= 0; --i) {
							if (CharactersList[i].internalName == id) {
								CharactersList.splice(i,1);
							}
						}
						updateDetails();
					} else {
						console.log('Removal operation aborted by user')
					}			
				}
			})
		});
	}

	function updateDetails() {
		let htmlCardTemplate = `
		<div class="row g-1 mx-0">
			<div class="col-md-4 p-2 text-center">
				<img src="images/{{image}}" class="img-fluid rounded-start" alt="Icon">
			</div>
			<div class="col-md-8 p-1">
				<div class="card-body p-0">
					<h5 class="card-title mb-1"><strong>{{characterName}}</strong></h5>
					<div class="mb-2 form-floating">
						<input type="text" class="form-control" name="conditions" id="{{internalName}}_conditions" value="{{conditions}}" class="border border-warning">
						<label for="{{internalName}}_conditions" class="form-label text-warning"><strong>Conditions</strong></label>
					</div>
					<div class="mb-2 form-floating">
						<input type="text" class="form-control" name="skills" id="{{internalName}}_skills" value="{{skills}}">
						<label for="{{internalName}}_skills" class="form-label text-info"><strong>Skills</strong></label>
					</div>
					<div class="mb-2 form-floating">
						<input type="text" class="form-control" name="equip" id="{{internalName}}_equip" value="{{equip}}">
						<label for="{{internalName}}_equip" class="form-label text-secondary"><strong>Equipped</strong></label>
					</div>
				</div>
			</div>
		</div>`;

		// destructive mode, force emptying and repopulating
		let listContainer = document.getElementById('detailsInner');
		listContainer.innerHTML = "";
		for (let i = 0; i < CharactersList.length; i++) {
			const c = CharactersList[i];
			let el = document.createElement('div');
			el.className = 'col-md-6 characterCard card mb-3';
			el.id = c.internalName + '_detail';
			el.innerHTML = htmlCardTemplate.replaceAll('{{characterName}}',c.name)
				.replaceAll('{{internalName}}', c.internalName)
				.replaceAll('{{conditions}}', (c.conditions ? c.conditions : ''))
				.replaceAll('{{skills}}', (c.skills ? c.skills : ''))
				.replaceAll('{{equip}}', (c.equip ? c.equip : ''))
				.replaceAll('{{image}}', (c.image ? c.image : '_generic.png'));
			listContainer.appendChild(el);
		}
	}

	var todo = {
		// (A) INITIALIZE TO DO LIST
		data : [], // todo list data array
		hAdd : null, // html add item text field
		hTemplate : null, // html item row template
		hList : null, // html to do list
		init : () => {
			// (A1) INIT LOCALSTORAGE
			if (localStorage.questTrackerTodoList == undefined) { localStorage.questTrackerTodoList = "[]"; }
	
			// (A2) RESTORE PREVIOUS SESSION
			todo.data = JSON.parse(localStorage.questTrackerTodoList);
	
			// (A3) GET HTML ELEMENTS
			todo.hAdd = document.getElementById("todo-item");
			todo.hTemplate = document.getElementById("todo-template").content;
			todo.hList = document.getElementById("todo-list");
	
			// (A4) "ENABLE" ADD ITEM FORM
			document.getElementById("todo-add").onsubmit = todo.add;
	
			// (A5) DRAW TO DO LIST
			todo.draw();
		},
  
		// (B) DRAW TO DO LIST
		draw : () => {
			// (B1) RESET LIST
			todo.hList.innerHTML = "";
	
			// (B2) LOOP & GENERATE ROWS
			if (todo.data.length > 0) { for (let id in todo.data) {
				let row = todo.hTemplate.cloneNode(true);
				row.querySelector(".todo-item").textContent = todo.data[id][0];
				row.querySelector(".todo-done").onclick = () => { todo.toggle(id); };
				row.querySelector(".todo-indent").onclick = () => { todo.toggleIndent(id); };
				row.querySelector(".todo-del").onclick = () => { todo.del(id); };
				if (todo.data[id][1]) {
					row.querySelector(".todo-item").classList.add("todo-ok");
				}
				if (todo.data[id][2]) {
					row.querySelector(".todo-item").classList.add("todo-indented");
				}				
				todo.hList.appendChild(row);
			}}
		},
  
		// (C) HELPER - SAVE DATA INTO LOCAL STORAGE
		save: () => {
			localStorage.questTrackerTodoList = JSON.stringify(todo.data);
			todo.draw();
		},
  
		// (D) ADD A NEW ITEM TO THE LIST
		add : () => {
			todo.data.push([todo.hAdd.value, false, false]);
			todo.hAdd.value = "";
			todo.save();
			return false;
		},
  
		// (E) UPDATE TODO ITEM DONE/NOT YET
		toggle: (id) => {
			todo.data[id][1] = !todo.data[id][1];
			todo.save();
		},
		// (E2) UPDATE TODO ITEM INDENTED / NOT INDENTED
		toggleIndent: (id) => {
			todo.data[id][2] = !todo.data[id][2];
			todo.save();
		},	
  
		// (F) DELETE ITEM
		del: (id) => { if (confirm("Delete task?")) {
			todo.data.splice(id, 1);
			todo.save();
		}}
	};

	todo.init();
});