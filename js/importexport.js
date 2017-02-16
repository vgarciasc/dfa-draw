var jsonArea = document.getElementById("json-area");

function Serialized_state(id, name, coord, radius, end, start) {
	this.id = id;
	this.name = name;
	this.coord = coord;
	this.radius = radius;
	this.end = end;
	this.start = start;
}

function Serialized_transition(id, state_src_id, state_dst_id, symbols) {
	this.id = id;
	this.state_src_id = state_src_id;
	this.state_dst_id = state_dst_id;
	this.symbols = symbols;
}

function importJson() {
	var json = document.getElementById("json-area").value;
	setJson(json);
}

function setJson(json) {
	if (json != "") {
		json = JSON.parse(json);
		document.getElementById("alphabet").value = json.alphabet;
		setAlphabet();

		stateList = json.states;

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
				json.transitions[i].symbols);

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

function getJson() {
	var json_states = [];
	var json_transitions = [];

	for (var i = 0; i < stateList.length; i++) {
		var state = stateList[i];
		json_states.push(new Serialized_state(state.id,
			state.name,
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
			transition.symbols));
	}

	var json = {alphabet: alphabet, states: json_states, transitions: json_transitions};
	return JSON.stringify(json);;
}

function exportJson() {
	document.getElementById("json-area").value = getJson();
}