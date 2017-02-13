var inTransition = false;

var transitionList = [];
var alphabet = [];

var tempSrc = null;
var tempDst = null;
var tempSymbol = null;
var nowFillingSymbol = false;

var hoveredTransition = null;

function transition(id, state_src, state_dst, symbol) {
	this.id = id;
	this.state_src = state_src;
	this.state_dst = state_dst;
	this.symbol = symbol;
	
	state_src.transitionsOut[state_src.transitionsOut.length] = this;
	state_dst.transitionsIn[state_dst.transitionsIn.length] = this;
}

function createTransition() {
	var state;

	if (!inTransition) {
		state = getSelectedState();
		if (!state) {
			return;
		}
		inTransition = true;
		tempSrc = state;
		selectedState.adding_transition = true;
	}
	else {
		state = getHoverState();
		if (!state) {
			return;
		}
		inTransition = false;
		var aux = new transition(transitionList.length, tempSrc, state, "_");
		nowFillingSymbol = true;
		addTransition(aux);
		tempSrc = null;
		selectedState.adding_transition = false;
		resetSelectedState();
	}
}

function setTransitionSymbol(sym) {
	transitionList[transitionList.length - 1].symbol = sym;
}

function addTransition(transition) {
	transitionList[transitionList.length] = transition;
}

function mouseOverTransition(tr) {
	if (tr.state_src.id == tr.state_dst.id) {
		var distance = Math.sqrt(Math.pow(mousePos.x - tr.state_src.coord.x + tr.state_src.radius, 2) +
			Math.pow(mousePos.y - tr.state_src.coord.y + tr.state_src.radius, 2));
		distance = Math.abs(distance - tr.state_src.radius);
		if (distance < 15) {
			return true;
		}

		return false;
	}

	var x1 = tr.state_src.coord.x;
	var x2 = tr.state_dst.coord.x;
	var y1 = tr.state_src.coord.y;
	var y2 = tr.state_dst.coord.y;

	var x0 = mousePos.x;
	var y0 = mousePos.y;

	var distance = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
	distance /= Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

	if (distance < 10) {
		return true;
	}

	return false;
}

function getTransitionByID(id) {
	for (var i = 0; i < transitionList.length; i++) {
		if (transitionList[i].id == id) {
			return transitionList[i];
		}
	}

	return null;
}

function stateContainsTransition(stateID, trID) {
	return (stateContainsTransitionOut(stateID, trID) ||
		stateContainsTransitionIn(stateID, trID));
}

function stateContainsTransitionIn(stateID, trID) {
	var state = getStateByID(stateID);
	for (var i = 0; i < state.transitionsIn.length; i++) {
		if (state.transitionsIn[i].id == trID) {
			return true;
		}
	}

	return false;
}

function stateContainsTransitionOut(stateID, trID) {
	var state = getStateByID(stateID);
	for (var i = 0; i < state.transitionsOut.length; i++) {
		if (state.transitionsOut[i].id == trID) {
			return true;
		}
	}

	return false;
}