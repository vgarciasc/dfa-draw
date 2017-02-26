var mousePos = {x: 0, y: 0};

function onMouseMove(e) {
	mousePos = getCursorPosition(e);
	var state = getSelectedState();

	if (getHoverState() == null) {
		updateHoveredTransition();
	}
	else {
		hoveredTransition = null;
	}

	if (runInfo.nowRunning) {
		return;
	}

	if (state && selectedState.moving) {
		moveStateByCursor(state);
	}
}

function onMouseDown(e) {
	var state = getHoverState();

	if (runInfo.nowRunning || selectedState.naming) {
		return;
	}

	if (state) {
		if (state != getSelectedState()) {
			selectState(state);
			resetSelectedTransition();
			hoveredTransition = null;
			return;
		}
		else {
			resetSelectedState();
			return;
		}
	}
	else {
		resetSelectedState();
	}

	if (hoveredTransition != null) {
		selectedTransition.id = hoveredTransition.id;
	}
	else {
		resetSelectedTransition();
	}
}

function onMouseUp(e) {
	selectedState.moving = false;
}

function onKeyPress(e) {
	var key = e.keyCode || e.which || 0;
	if (selectedTransition.id != -1) {
		if (key == 13) { //enter
			nowFillingSymbol.now = false;
			if (getSymbolsTransition(selectedTransition.id).length == 0) {
				removeTransition(selectedTransition.id);
			}
			selectedTransition.id = -1;
			return;
		}

		var symbol = String.fromCharCode(key);
		addTransitionSymbol(symbol);
		return;
	}

	if (selectedState.id != -1 && selectedState.naming) {
		if (key == 13) { //enter
			if (getStateByID(selectedState.id).name.length == 0) {
				return; //dont let the user name a state null
			}
			selectedState.naming = false;
			resetSelectedState();
			return;
		}

		var symbol = String.fromCharCode(key);
		typeStateName(symbol);
		return;
	}

	switch (key) {
		case 113:
			createState();
			break;
		case 101:
			createTransition();
			break;
		case 102:
			setFinalState();
			break;
		case 115:
			setInitialState();
			break;
		case 114:
			nameState();
			break;
	}
}

function onKeyDown(e) {
	var key = e.keyCode || e.which || 0;
	if (selectedTransition.id != -1) {
		//backspace
		if (key == 8) {
			removeLastSymbol();
			return;
		}

		//delete
		if (key == 46) {
			removeTransition(selectedTransition.id);
			return;
		}
	}

	if (selectedState.id != -1) {
		//delete
		if (key == 46) {
			removeState(selectedState.id);
			return;
		}

		if (key == 8 && selectedState.naming) {
			typeStateName("backspace");
			return;
		}
	}
}

function getCursorPosition(e) {
    return {x: e.offsetX,
    		y: e.offsetY}
}

function isMouseOverState(state) {
	if (Math.sqrt(Math.pow(mousePos.x - state.coord.x, 2) +
		Math.pow(mousePos.y - state.coord.y, 2)) < state.radius) {
		return true;
	}

	return false;
}

function getHoverState() {
	for (var i = 0; i < stateList.length; i++) {
		var state = stateList[i];
		if (isMouseOverState(state)) {
			return state;
		}
	}

	return null;
}

function updateHoveredTransition() {
	for (var i = 0; i < transitionList.length; i++) {
		if (mouseOverTransition(transitionList[i])) {
			hoveredTransition = transitionList[i];
			return;
		}
	}

	hoveredTransition = null;
}

function isHoveredState(state) {
	if (Math.sqrt(Math.pow(mousePos.x - state.coord.x, 2) +
		Math.pow(mousePos.y - state.coord.y, 2)) < state.radius) {
		return true;
	}

	return false;
}

function nameState() {
	selectedState.naming = true;
}