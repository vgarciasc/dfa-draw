var mousePos = {x: 0, y: 0};

function onMouseMove(e) {
	mousePos = getCursorPosition(e);
	var state = getSelectedState();

	updateHoveredTransition();

	if (runInfo.nowRunning) {
		return;
	}

	if (state && selectedState.moving) {
		moveStateByCursor(state);
	}
}

function onMouseDown(e) {
	var state = getHoverState();

	if (runInfo.nowRunning) {
		return;
	}

	if (state) {
		if (state != getSelectedState()) {
			selectState(state);
		}
		else {
			resetSelectedState();
		}
	}
	else {
		resetSelectedState();
	}

	updateHoveredTransition();
	if (hoveredTransition != null) {
		selectedTransition.id = hoveredTransition.id;
	}
	else {
		selectedTransition.id = -1;
	}
}

function onMouseUp(e) {
	selectedState.moving = false;
}

function onKeyPress(e) {
	if (selectedTransition.id != -1) {
		if (e.keyCode == 13) { //enter
			nowFillingSymbol.now = false;
			if (getSymbolsTransition(selectedTransition.id).length == 0) {
				removeTransition(selectedTransition.id);
			}
			selectedTransition.id = -1;
			return;
		}

		var symbol = String.fromCharCode(e.keyCode);
		addTransitionSymbol(symbol);
	}

	switch (e.keyCode) {
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
	}
}

function onKeyDown(e) {
	if (selectedTransition.id != -1) {
		//backspace
		if (e.keyCode == 8) {
			removeLastSymbol();
			return;
		}

		//delete
		if (e.keyCode == 46) {
			removeTransition(selectedTransition.id);
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