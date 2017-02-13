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
}

function onMouseUp(e) {
	selectedState.moving = false;
}

function onKeyPress(e) {
	if (nowFillingSymbol) {
		var symbol = String.fromCharCode(e.keyCode);
		if (alphabet.indexOf(symbol) != -1) {
			nowFillingSymbol = false;
			setTransitionSymbol(String.fromCharCode(e.keyCode));
		}
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

	hoveredTransition = -1;
}