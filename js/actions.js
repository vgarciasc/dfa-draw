var stateList = [];

function coord(x, y) {
	this.x = x;
	this.y = y;
}

function state(id, name, coord, radius, end, start, transitionsIn, transitionsOut) {
	this.id = id;
	this.name = name;
	this.coord = coord;
	this.radius = radius;
	this.end = end;
	this.start = start;
	this.transitionsIn = transitionsIn;
	this.transitionsOut = transitionsOut;
}

function createState() {
	stateList[stateList.length] = new state(stateList.length,
		stateList.length.toString(),
		new coord(mousePos.x, mousePos.y),
		20,
		false,
		false,
		[],
		[]);
}

function selectState(state) {
	if (selectedState.adding_transition) {
		createTransition();
		return;
	}

	selectedState.id = state.id;
	selectedState.selecting = true;
	selectedState.moving = true;
}

function resetSelectedState() {
	selectedState.id = -1;
	selectedState.selecting = false;
	selectedState.naming = false;
}

function isSelected(state) {
	return (selectedState.id == state.id && selectedState.selecting);
}

function getSelectedState() {
	if (selectedState.id == -1) {
		return null;
	}

	return stateList[selectedState.id];
}

function moveStateByCursor(state) {
	state.coord.x = mousePos.x;
	state.coord.y = mousePos.y;		
	
	if (state.coord.x + state.radius > canvas.width) {
		state.coord.x = canvas.width - state.radius;
	}

	if (state.coord.x - state.radius < 0) {
		state.coord.x = state.radius;
	}

	if (state.coord.y + state.radius > canvas.height) {
		state.coord.y = canvas.height - state.radius;
	}

	if (state.coord.y - state.radius < 0) {
		state.coord.y = state.radius;
	}
}

function setFinalState() {
	var state = getSelectedState();
	if (!state) {
		return;
	}	

	state.end = !state.end;
}

function setInitialState() {
	var state = getSelectedState();
	if (!state) {
		return;
	}

	for (var i = 0; i < stateList.length; i++) {
		stateList[i].start = false;
	}

	state.start = true;
}

function getInitialState() {
	for (var i = 0; i < stateList.length; i++) {
		if (stateList[i].start) {
			return stateList[i];
		}
	}

	return null;
}

function getStateByID(id) {
	for (var i = 0; i < stateList.length; i++) {
		if (stateList[i].id == id) {
			return stateList[i];
		}
	}

	return null;
}

function removeState(stateID) {
	if (stateID == -1) {
		return;
	}

	var state = getStateByID(stateID);

	for (var i = 0; i < state.transitionsOut.length; i++) {
		removeTransition(state.transitionsOut[i].id);
	}

	for (var i = 0; i < state.transitionsIn.length; i++) {
		removeTransition(state.transitionsIn[i].id);
	}

	var index = 0;
	stateList.splice(stateID, 1);
	for (var i = stateID; i < stateList.length; i++) {
		stateList[i].id = i;
	}
}

function typeStateName(symbol) {
	var state = getStateByID(selectedState.id);

	if (state == null) {
		return;
	}

	if (symbol == "backspace") {
		if (state.name.length > 0) {
			state.name = state.name.slice(0, state.name.length - 1);
		}
		return;
	}
	
	if (state.name.length < 4) {
		state.name = state.name.concat(symbol);
	}
}

function isThereFinalState() {
	for (var i = 0; i < stateList.length; i++) {
		if (stateList[i].end) {
			return true;
		}
	}

	return false;
}