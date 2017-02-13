var jsonArea = document.getElementById("json-area");

function Serialized_state(id, coord, radius, end, start) {
	this.id = id;
	this.coord = coord;
	this.radius = radius;
	this.end = end;
	this.start = start;
}

function Serialized_transition(id, state_src_id, state_dst_id, symbol) {
	this.id = id;
	this.state_src_id = state_src_id;
	this.state_dst_id = state_dst_id;
	this.symbol = symbol;
}

function importJson() {
	var json = document.getElementById("json-area").value;

	if (json != "") {
		json = JSON.parse(json);
		stateList = json.states;
		document.getElementById("alphabet").value = json.alphabet;
		setAlphabet();

		transitionList = [];

		for (var i = 0; i < stateList.length; i++) {
			stateList[i].transitionsIn = [];
			stateList[i].transitionsOut = [];
		}

		for (var i = 0; i < json.transitions.length; i++) {
			var state_src = getStateByID(json.transitions[i].state_src_id);
			var state_dst = getStateByID(json.transitions[i].state_dst_id);
			var tr = new transition(json.transitions[i].id,
				state_src,
				state_dst,
				json.transitions[i].symbol);

			transitionList.push(tr);
			if (!stateContainsTransition(state_src.id, tr.id)) {
				state_src.transitionsOut.push(tr);
			}
			if (!stateContainsTransition(state_dst.id, tr.id)) {
				state_dst.transitionsIn.push(tr);
			}
		}
	}
}

function exportJson() {
	var json_states = [];
	var json_transitions = [];

	for (var i = 0; i < stateList.length; i++) {
		var state = stateList[i];
		json_states.push(new Serialized_state(state.id,
			state.coord,
			state.radius,
			state.end,
			state.start));
	}

	for (var i = 0; i < transitionList.length; i++) {
		var transition = transitionList[i];
		json_transitions.push(new Serialized_transition(transition.id,
			transition.state_src.id,
			transition.state_dst.id,
			transition.symbol));
	}

	var json = {alphabet: alphabet, states: json_states, transitions: json_transitions};
	document.getElementById("json-area").value = JSON.stringify(json);
}