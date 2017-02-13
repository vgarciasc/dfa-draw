function frameInfo(stateID, transitionID) {
	this.stateID = stateID;
	this.transitionID = transitionID;
}

function run() {
	var input = document.getElementById("input-word").value;
	runInfo.input = input;

	var currentState = getInitialState();
	var nextState = null;

	if (!currentState) {
		console.log("no initial state");
		return;
	}

	if (alphabet == []) {
		console.log("alphabet not set");
		return;
	}

	if (!isAutomataComplete()) {
		console.log("automata not complete");
		return;
	}

	var queue = [];

	while (input != "") {
		var current_symbol;
		current_symbol = input[0];
		queue.push(new frameInfo(currentState.id, null));

		console.log(current_symbol);

		for (var i = 0; i < currentState.transitionsOut.length; i++) {
			if (currentState.transitionsOut[i].symbol == current_symbol) {
				nextState = currentState.transitionsOut[i].state_dst;
				queue.push(new frameInfo(null, currentState.transitionsOut[i].id));
				break;
			}
		}

		currentState = nextState;		

		input = input.substring(1, input.length);
	}

	queue.push(new frameInfo(currentState.id, null));

	runAnimation(queue);
}

function runAnimation(queue) {
	runInfo.nowRunning = true;
	runInfo.currentChar = 0;

	var timeSkipAmount = 400;
	var timeSkipCount = 0;

	var framecount = 0;
	for (var i = 0; i < queue.length; i++) {
		setTimeout(function() {
			var frame = queue[framecount];
			framecount++;

			if (frame.stateID != null) {
				runInfo.transitionID = null;
				runInfo.stateID = frame.stateID;
			}
			if (frame.transitionID != null) {
				runInfo.transitionID = frame.transitionID;
				runInfo.stateID = null;
				runInfo.currentChar++;
			}

		}, timeSkipAmount * timeSkipCount++);
	}

	setTimeout(function() {
		runInfo.nowRunning = false;
		$("#results").append("\'" + runInfo.input + "\': ");
		if (getStateByID(queue[queue.length - 1].stateID).end) {
			$("#results").append("accepted. <br>");
		}
		else {
			$("#results").append("rejected. <br>");
		}
	}, timeSkipAmount * timeSkipCount++);
}

function isAutomataComplete() {
	var exitSymbols = [];

	for (var i = 0; i < stateList.length; i++) {
		exitSymbols = alphabet.slice();

		for (var j = 0; j < stateList[i].transitionsOut.length; j++) {
			var aux = exitSymbols.indexOf(stateList[i].transitionsOut[j].symbol);
			if (aux != -1) {
				exitSymbols.splice(aux, 1);
			}
		}

		if (exitSymbols.length != 0) {
			return false;
		}
	}

	return true;
}

function setAlphabet() {
	var aux = document.getElementById("alphabet").value;
	aux.replace(" ", "");
	aux.replace(",", "");

	alphabet = [];
	while (aux != "") {
		var symbol = aux[0];

		if (symbol != "," && symbol != " " &&
			alphabet.indexOf(symbol) == -1) {
			alphabet[alphabet.length] = symbol;
		}

		aux = aux.substring(1, aux.length);
	}
}