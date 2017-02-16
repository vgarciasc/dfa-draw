var inTransition = false;

var transitionList = [];
var alphabet = [];

var tempSrc = null;
var tempDst = null;
var tempSymbol = null;
var nowFillingSymbol = {now: false};

var hoveredTransition = null;

function transition(id, state_src, state_dst, symbols) {
	this.id = id;
	this.state_src = state_src;
	this.state_dst = state_dst;
	this.symbols = symbols;
	
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
		var trID = getTransitionBetweenStates(tempSrc.id, state.id);
		if (trID != -1) {
			selectedTransition.id = trID;
		}
		else {
			var aux = new transition(transitionList.length, tempSrc, state, []);
			nowFillingSymbol.now = true;
			addTransition(aux);
			selectedTransition.id = aux.id;
		}

		inTransition = false;
		tempSrc = null;
		selectedState.adding_transition = false;
		resetSelectedState();
	}
}

function addTransition(transition) {
	transitionList[transitionList.length] = transition;
}

function mouseOverTransition(tr) {
	if (tr.state_src.id == tr.state_dst.id) {
		var offset = new coord(tr.state_src.radius, tr.state_src.radius);

		switch (tr.cyclealignment) {
			case "topleft": default:
				break;
			case "topright":
				offset.x *= -1;
				break;
			case "bottomleft":
				offset.y *= -1;
				break;
			case "bottomright":
				offset.y *= -1;
				offset.x *= -1;
				break;
		}


		var distance = Math.sqrt(Math.pow(mousePos.x - tr.state_src.coord.x + offset.x, 2) +
			Math.pow(mousePos.y - tr.state_src.coord.y + offset.y, 2));
		distance = Math.abs(distance - tr.state_src.radius);
		if (distance < 8) {
			return true;
		}

		return false;
	}

	// var x1 = tr.state_src.coord.x;
	// var x2 = tr.state_dst.coord.x;
	// var y1 = tr.state_src.coord.y;
	// var y2 = tr.state_dst.coord.y;

	// var x0 = mousePos.x;
	// var y0 = mousePos.y;

	// var distance = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
	// distance /= Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

	if (tr.curve == null) {
		return false;
	}

	var distance = jsBezier.distanceFromCurve(mousePos, tr.curve.curve);

	if (distance.distance < 7) {
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

function removeLastSymbol() {
	if (selectedTransition.id == -1) {
		return;
	}

	var tr = transitionList[selectedTransition.id];

	tr.symbols.pop();
}

function addTransitionSymbol(sym) {
	if (selectedTransition.id == -1) {
		return;
	}

	var tr = transitionList[selectedTransition.id];

	for (var i = 0; i < tr.state_src.transitionsOut.length; i++) {
		var aux = tr.state_src.transitionsOut[i];
		if (aux.symbols.indexOf(sym) != -1) {
			return;
		}
	}

	if (alphabet.indexOf(sym) != -1 && tr.symbols.indexOf(sym) == -1) {
		tr.symbols.push(sym);
	} 
}

function removeTransition(trID) {
	var tr = getTransitionByID(trID);
	if (tr == null) {
		return;
	}

	var index = transitionList.indexOf(tr);

	transitionList.splice(index, 1);

	for (var i = index; i < transitionList.length; i++) {
		transitionList[i].id = i;
	}

	if (selectedTransition.id == trID) {
		selectedTransition.id = -1;
	}

	setJson(getJson());
}

function getSymbolsTransition(trID) {
	if (trID == -1) {
		return null;
	}

	return getTransitionByID(trID).symbols;
}

function getTransitionBetweenStates(fromID, toID) {
	var from = getStateByID(fromID);

	for (var i = 0; i < from.transitionsOut.length; i++) {
		if (from.transitionsOut[i].state_dst.id == toID) {
			return from.transitionsOut[i].id;
		}
	}

	return -1;
}

function resetSelectedTransition() {
	if (selectedTransition.id != -1) {
		var tr = getTransitionByID(selectedTransition.id);
		if (getSymbolsTransition(tr.id).length == 0) {
			removeTransition(tr.id);
		}
	}

	selectedTransition.id = -1;
}