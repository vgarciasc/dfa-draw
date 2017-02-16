var fps = 60;
var canvas, context;

var selectedState = {id: -1, selecting: false, hovering: false, moving: false, adding_transition: false, naming: false};
var selectedTransition = {id: -1};

var runInfo = {nowRunning: false, transitionID: null, stateID: null, input: null, currentChar: null};

//COLORS

var st_idle_fill_color = "rgb(255, 232, 136)";
var st_idle_stroke_color = "rgb(217, 187, 58)";

var st_selected_fill_color = "rgb(255, 135, 20)";
var st_selected_stroke_color = "rgb(194, 95, 0)";

var st_hover_fill_color = "rgb(211, 195, 128)";
var st_hover_stroke_color = "rgb(145, 127, 49)";

var st_run_fill_color = "rgb(169, 78, 234)";
var st_run_stroke_color = "rgb(99, 5, 167)";

var st_transition_fill_color = "rgb(28, 105, 185)";
var st_transition_stroke_color = "rgb(6, 65, 126)";

var tr_selected_color = "rgb(194, 95, 0)";
var tr_hovered_color = "rgb(145, 127, 49)";
var tr_idle_color = "rgb(6, 11, 16)";
var tr_run_color = "rgb(169, 78, 234)";;

var text_color = "rgb(6, 11, 16)";

window.onload = function() {
	start();
	setInterval(draw, 
		1000/fps);
	setInterval(validateInput,
		1000/fps);
};

function start() {
	transitionList = [];
	stateList = [];

	canvas = document.getElementById("main-canvas");
	context = canvas.getContext("2d");

	canvas.addEventListener("mousedown", onMouseDown, false);
	canvas.addEventListener("mouseup", onMouseUp, false);
	canvas.addEventListener("mousemove", onMouseMove, false);
	window.addEventListener("keypress", onKeyPress, false);
	window.addEventListener("keydown", onKeyDown, false);

	$("#canvas").hide();
	$("#input-word").bind("change paste keyup", validateInput);

	context.lineWidth = 3;
}

function draw() {
	cleanCanvas();

	context.globalAlpha = 0.2;
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.globalAlpha = 1;

	for (var i = 0; i < transitionList.length; i++) {
		drawTransition(context, transitionList[i]);
	}

	if (selectedState.adding_transition) {
		drawTempTransition(context);
	}

	for (var i = 0; i < stateList.length; i++) {
		drawState(context, stateList[i]);
	}

	drawRunText(context);
}

function cleanCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawState(ctx, state) {
	ctx.beginPath();
	ctx.arc(state.coord.x,
		state.coord.y,
		state.radius,
		0,
		Math.PI * 2,
		false);
	setStateColor(ctx, state);
	ctx.fill();

	setStateStroke(ctx, state);
	ctx.stroke();

	drawStateID(ctx, state);

	if (state.end) {
		ctx.beginPath();
		ctx.arc(state.coord.x,
			state.coord.y,
			state.radius * 10 / 8,
			0,
			Math.PI * 2,
			false);
		ctx.stroke();
	}

	if (state.start) {
		ctx.font = "20px Georgia";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = text_color;
		ctx.fillText("I ==>",
			state.coord.x - state.radius,
			state.coord.y);
	}
}

function drawStateID(ctx, state) {
	setFillingSymbol(ctx, state, null);

	ctx.font = "15px Georgia";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = text_color;
	ctx.fillText(state.name,
		state.coord.x,
		state.coord.y);
}

function setStateColor(ctx, state) {
	setFillingSymbol(ctx, state, null);

	if (runInfo.nowRunning && runInfo.stateID == state.id) {
		ctx.fillStyle = st_run_fill_color;
		return;
	}

	if (isSelected(state)) {
		if (selectedState.adding_transition) {
			ctx.fillStyle = st_transition_fill_color;
		}
		else {
			ctx.fillStyle = st_selected_fill_color;
		}
	}
	else if (isHoveredState(state)) {
		ctx.fillStyle = st_hover_fill_color;
	}
	else {
		ctx.fillStyle = st_idle_fill_color;
	}
}

function setStateStroke(ctx, state) {
	setFillingSymbol(ctx, state, null);

	if (runInfo.nowRunning && runInfo.stateID == state.id) {
		ctx.strokeStyle = st_run_stroke_color;
		return;
	}

	if (isSelected(state)) {
		if (selectedState.adding_transition) {
			ctx.strokeStyle = st_transition_stroke_color;
		}
		else {
			ctx.strokeStyle = st_selected_stroke_color;
		}
	}
	else if (isHoveredState(state)) {
		ctx.strokeStyle = st_hover_stroke_color;
	}
	else {
		ctx.strokeStyle = st_idle_stroke_color;
	}
}

function drawTransition(ctx, tr) {
	setFillingSymbol(ctx, null, tr);

	setTransitionColor(ctx, tr);

	if (tr.state_src.id == tr.state_dst.id) {
		drawTransitionCircle(ctx, tr);
	}
	else {
		drawTransitionOver(ctx, tr);
	}
}

function setTransitionColor(ctx, tr) {
	setFillingSymbol(ctx, null, tr);

	if (runInfo.nowRunning && runInfo.transitionID == tr.id) {
		ctx.strokeStyle = ctx.fillStyle = tr_run_color;
		return;
	}

	if (selectedTransition.id != -1 && selectedTransition.id == tr.id) {
		ctx.strokeStyle = ctx.fillStyle = tr_selected_color;
		return;
	}

	if (hoveredTransition != null && hoveredTransition.id == tr.id &&
		!runInfo.nowRunning) {
		ctx.strokeStyle = ctx.fillStyle = tr_hovered_color;
	}
	else {
		ctx.strokeStyle = ctx.fillStyle = tr_idle_color;
	}
}

function setFillingSymbol(ctx, st, tr) {
	if (selectedTransition.id != -1) {
		if (tr != null && tr.id == selectedTransition.id) {
			ctx.globalAlpha = 1;
		}
		else {
			ctx.globalAlpha = 0.3;
		}
	}
	else if (selectedState.id != -1 && selectedState.naming) {
		if (st != null && st.id == selectedState.id) {
			ctx.globalAlpha = 1;
		}
		else {
			ctx.globalAlpha = 0.3;
		}
	}
	else {
		ctx.globalAlpha = 1;
	}
}

function drawTransitionCircle(ctx, tr) {
	var center = new coord(tr.state_src.coord.x,
		tr.state_src.coord.y);
	var arrow_tilt = new coord(10, 3);
	var arrow_p1 = new coord(0, 0);
	var arrow_p2 = new coord(0, 0);
	var arrow_p3 = new coord(0, 0);

	var radius = tr.state_src.radius;

	var possiblePlace = {topleft: true, topright: true, bottomleft: true, bottomright: true};

	for (var i = 0; i < tr.state_src.transitionsIn.length; i++) {
		if (tr.state_src.transitionsIn[i].state_src.coord.x < tr.state_src.coord.x &&
			tr.state_src.transitionsIn[i].state_src.coord.y < tr.state_src.coord.y) {
			possiblePlace.topleft = false;
		}
		if (tr.state_src.transitionsIn[i].state_src.coord.x > tr.state_src.coord.x &&
			tr.state_src.transitionsIn[i].state_src.coord.y < tr.state_src.coord.y) {
			possiblePlace.topright = false;
		}
		if (tr.state_src.transitionsIn[i].state_src.coord.x < tr.state_src.coord.x &&
			tr.state_src.transitionsIn[i].state_src.coord.y > tr.state_src.coord.y) {
			possiblePlace.bottomleft = false;
		}
		if (tr.state_src.transitionsIn[i].state_src.coord.x > tr.state_src.coord.x &&
			tr.state_src.transitionsIn[i].state_src.coord.y > tr.state_src.coord.y) {
			possiblePlace.bottomright = false;
		}
	}

	for (var i = 0; i < tr.state_src.transitionsOut.length; i++) {
		if (tr.state_src.transitionsOut[i].state_dst.coord.x < tr.state_src.coord.x &&
			tr.state_src.transitionsOut[i].state_dst.coord.y < tr.state_src.coord.y) {
			possiblePlace.topleft = false;
		}
		if (tr.state_src.transitionsOut[i].state_dst.coord.x > tr.state_src.coord.x &&
			tr.state_src.transitionsOut[i].state_dst.coord.y < tr.state_src.coord.y) {
			possiblePlace.topright = false;
		}
		if (tr.state_src.transitionsOut[i].state_dst.coord.x < tr.state_src.coord.x &&
			tr.state_src.transitionsOut[i].state_dst.coord.y > tr.state_src.coord.y) {
			possiblePlace.bottomleft = false;
		}
		if (tr.state_src.transitionsOut[i].state_dst.coord.x > tr.state_src.coord.x &&
			tr.state_src.transitionsOut[i].state_dst.coord.y > tr.state_src.coord.y) {
			possiblePlace.bottomright = false;
		}
	}

		ctx.font = "15px Georgia";

	if (possiblePlace.topleft) {
		center = new coord(tr.state_src.coord.x - radius,
			tr.state_src.coord.y - radius);

		arrow_p1 = new coord(tr.state_src.coord.x,
			tr.state_src.coord.y - radius);
		arrow_p2 = new coord(arrow_p1.x - radius / 3 - 2,
			arrow_p1.y - radius / 2);
		arrow_p3 = new coord(arrow_p1.x + radius / 3 - 3,
			arrow_p1.y - radius / 2 - 3);

		tr.cyclealignment = "topleft";

		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(tr.symbols,
			center.x - radius - 2,
			center.y - radius / 2);
	}

	else if (possiblePlace.topright) {
		center = new coord(tr.state_src.coord.x + radius,
			tr.state_src.coord.y - radius);

		arrow_p1 = new coord(tr.state_src.coord.x,
			tr.state_src.coord.y - radius);
		arrow_p2 = new coord(arrow_p1.x + radius / 3 + 2,
			arrow_p1.y - radius / 2);
		arrow_p3 = new coord(arrow_p1.x - radius / 3 + 3,
			arrow_p1.y - radius / 2 - 3);

		tr.cyclealignment = "topright";

		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(tr.symbols,
			center.x + radius + 2,
			center.y - radius / 2);
	}
	else if (possiblePlace.bottomleft) {
		center = new coord(tr.state_src.coord.x - radius,
			tr.state_src.coord.y + radius);

		arrow_p1 = new coord(tr.state_src.coord.x,
			tr.state_src.coord.y + radius);
		arrow_p2 = new coord(arrow_p1.x - radius / 3 - 2,
			arrow_p1.y + radius / 2);
		arrow_p3 = new coord(arrow_p1.x + radius / 3 - 3,
			arrow_p1.y + radius / 2 + 3);
		
		tr.cyclealignment = "bottomleft";

		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(tr.symbols,
			center.x - radius - 2,
			center.y - radius / 2);
	}
	else /*if (possiblePlace.bottomright)*/ {
		center = new coord(tr.state_src.coord.x + radius,
			tr.state_src.coord.y + radius);

		arrow_p1 = new coord(tr.state_src.coord.x,
			tr.state_src.coord.y + radius);
		arrow_p2 = new coord(arrow_p1.x + radius / 3 + 2,
			arrow_p1.y + radius / 2);
		arrow_p3 = new coord(arrow_p1.x - radius / 3 + 3,
			arrow_p1.y + radius / 2 + 3);

		tr.cyclealignment = "bottomright";

		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(tr.symbols,
			center.x + radius + 2,
			center.y - radius / 2);
	}

	ctx.beginPath();

	ctx.arc(center.x,
		center.y,
		radius,
		0,
		Math.PI * 2,
		false);

	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(arrow_p1.x, arrow_p1.y);
	ctx.lineTo(arrow_p2.x, arrow_p2.y);
	ctx.lineTo(arrow_p3.x, arrow_p3.y);
	ctx.closePath();
	ctx.fill();

	//symbol
	ctx.font = "15px Georgia";
}

function drawTransitionOver(ctx, tr) {
	ctx.beginPath();

	var src = new coord(tr.state_src.coord.x,
		tr.state_src.coord.y);
	var dst = new coord(tr.state_dst.coord.x,
		tr.state_dst.coord.y);

	var aux_angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	var multiplier = tr.state_src.radius;
	dst.x = dst.x - Math.cos(aux_angle) * multiplier;
	dst.y = dst.y - Math.sin(aux_angle) * multiplier;
	src.x = src.x + Math.cos(aux_angle) * multiplier;
	src.y = src.y + Math.sin(aux_angle) * multiplier;

	var vector2_dir = new coord(dst.x - src.x,
		dst.y - src.y);
	vector2_dir = normalizeVector(vector2_dir);
	vector2_dir = multiplyVector(vector2_dir, 20);

	var middle_pt1 = new coord(src.x + (dst.x - src.x)/3,
		src.y + (dst.y - src.y)/3);

	var middle_pt2 = new coord(src.x + 2*(dst.x - src.x)/3,
		src.y + 2*(dst.y - src.y)/3);

	var vector2_ort = new coord(src.y - dst.y,
		dst.x - src.x);
	vector2_ort = normalizeVector(vector2_ort);
	vector2_ort = multiplyVector(vector2_ort, 7.5);

	var arrow_pt = new coord(dst.x - (vector2_dir.x * 2) + vector2_ort.x * 2,
		dst.y - (vector2_dir.y * 2) + vector2_ort.y);

	var aux_mlt = Math.sqrt(Math.pow(dst.x - src.x, 2) + Math.pow(dst.y - src.y, 2)) / 40;

	var quadPoint1 = new coord(middle_pt1.x + vector2_ort.x * aux_mlt,
		middle_pt1.y + vector2_ort.y * aux_mlt);

	var quadPoint2 = new coord(middle_pt2.x + vector2_ort.x * aux_mlt,
		middle_pt2.y + vector2_ort.y * aux_mlt);

	//line
	ctx.moveTo(src.x, src.y);
	ctx.bezierCurveTo(quadPoint1.x,
		quadPoint1.y,
		quadPoint2.x,
		quadPoint2.y,
		dst.x,
		dst.y);

	tr.curve = new bezcurve(src, quadPoint1, quadPoint2, dst);

	ctx.stroke();

	//arrow
	ctx.beginPath();
	// ctx.moveTo(arrow_pt.x - vector2_ort.x,
	// 	arrow_pt.y - vector2_ort.y);
	// ctx.lineTo(arrow_pt.x + vector2_ort.x,
	// 	arrow_pt.y + vector2_ort.y);
	// ctx.lineTo(arrow_pt.x + vector2_dir.x,
	// 	arrow_pt.y + vector2_dir.y);
	// ctx.closePath();

	var arrowAngle = Math.atan2(quadPoint2.x - dst.x, quadPoint2.y - dst.y) + Math.PI;
	var arrowWidth = 13;

	ctx.moveTo(dst.x - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)), 
	           dst.y - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));

	ctx.lineTo(dst.x, dst.y);

	ctx.lineTo(dst.x - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)), 
	           dst.y - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));

	ctx.fill();

	var text_pos = new coord(0, 0);
	text_pos = new coord(src.x + (dst.x - src.x)/2 + vector2_ort.x * aux_mlt,
		src.y + (dst.y - src.y)/2 + vector2_ort.y * aux_mlt);

	if (Math.abs(src.y - dst.y) < 40) {
		if (src.x < dst.x) {
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
		}
		else {
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
		}
	}
	else {
		if (src.y < dst.y) {
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
		}
		else {
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
		}
	}

	//symbol
	ctx.font = "15px Georgia";
	ctx.fillText(tr.symbols,
		text_pos.x,
		text_pos.y);
}

function bezcurve(start, coord1, coord2, end) {
	var curve = [];
	curve.push(start);
	curve.push(coord1);
	curve.push(coord2);
	curve.push(end);
	this.curve = curve;
}

function drawTempTransition(ctx) {
	var state = getStateByID(selectedState.id);
	if (state == null) {
		return;
	}

	ctx.strokeStyle = ctx.fillStyle = tr_idle_color;

	var src = new coord(state.coord.x, state.coord.y);
	var dst = new coord(mousePos.x, mousePos.y);

	var aux_angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	var multiplier = state.radius;
	dst.x = dst.x - Math.cos(aux_angle) * multiplier;
	dst.y = dst.y - Math.sin(aux_angle) * multiplier;
	src.x = src.x + Math.cos(aux_angle) * multiplier;
	src.y = src.y + Math.sin(aux_angle) * multiplier;

	var vector2_dir = new coord(dst.x - src.x,
		dst.y - src.y);
	vector2_dir = normalizeVector(vector2_dir);
	vector2_dir = multiplyVector(vector2_dir, 20);

	var middle_pt1 = new coord(src.x + (dst.x - src.x)/3,
		src.y + (dst.y - src.y)/3);

	var middle_pt2 = new coord(src.x + 2*(dst.x - src.x)/3,
		src.y + 2*(dst.y - src.y)/3);

	var vector2_ort = new coord(src.y - dst.y,
		dst.x - src.x);
	vector2_ort = normalizeVector(vector2_ort);
	vector2_ort = multiplyVector(vector2_ort, 7.5);

	var arrow_pt = new coord(dst.x - (vector2_dir.x * 2) + vector2_ort.x * 2,
		dst.y - (vector2_dir.y * 2) + vector2_ort.y);

	var aux_mlt = Math.sqrt(Math.pow(dst.x - src.x, 2) + Math.pow(dst.y - src.y, 2)) / 40;

	var quadPoint1 = new coord(middle_pt1.x + vector2_ort.x * aux_mlt,
		middle_pt1.y + vector2_ort.y * aux_mlt);

	var quadPoint2 = new coord(middle_pt2.x + vector2_ort.x * aux_mlt,
		middle_pt2.y + vector2_ort.y * aux_mlt);

	//line
	ctx.moveTo(src.x, src.y);
	ctx.bezierCurveTo(quadPoint1.x,
		quadPoint1.y,
		quadPoint2.x,
		quadPoint2.y,
		dst.x,
		dst.y);

	if (getHoverState() == null) {
		ctx.globalAlpha = 0.3;
	}
	else {
		if (getHoverState().id == state.id) {
			ctx.beginPath();
			ctx.globalAlpha = 0.3;
			ctx.arc(state.coord.x - state.radius,
				state.coord.y - state.radius,
				state.radius,
				0,
				Math.PI * 2,
				false);
			ctx.stroke();

			arrow_p1 = new coord(state.coord.x,
				state.coord.y - state.radius);
			arrow_p2 = new coord(arrow_p1.x - state.radius / 3 - 2,
				arrow_p1.y - state.radius / 2);
			arrow_p3 = new coord(arrow_p1.x + state.radius / 3 - 3,
				arrow_p1.y - state.radius / 2 - 3);
			ctx.beginPath();
			ctx.moveTo(arrow_p1.x, arrow_p1.y);
			ctx.lineTo(arrow_p2.x, arrow_p2.y);
			ctx.lineTo(arrow_p3.x, arrow_p3.y);
			ctx.closePath();
			ctx.fill();
			return;
		}
	}

	ctx.stroke();

	ctx.beginPath();

	var arrowAngle = Math.atan2(quadPoint2.x - dst.x, quadPoint2.y - dst.y) + Math.PI;
	var arrowWidth = 13;

	ctx.moveTo(dst.x - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)), 
	           dst.y - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));

	ctx.lineTo(dst.x, dst.y);

	ctx.lineTo(dst.x - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)), 
	           dst.y - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));

	ctx.fill();
}

function clamp(num, min, max) {
	if (num < min) return min;
	if (num > max) return max;
	return num;
}

function normalizeVector(vec) {
	var aux = Math.pow(vec.x, 2) + Math.pow(vec.y, 2);
	aux = Math.sqrt(aux);

	return new coord(vec.x / aux, vec.y / aux);
}

function multiplyVector(vec, value) {
	return new coord(vec.x * value, vec.y * value);
}

function drawRunText(ctx) {
	if (!runInfo.nowRunning) {
		return;
	}

	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.font = "40px Georgia";

	var start_pos = new coord(0, 0);
	var x = 0;

	for (var i = 0; i < runInfo.input.length; i++) {
		var ch = runInfo.input.charAt(i);
		if (i < runInfo.currentChar) {
			ctx.fillStyle = "rgb(169, 78, 234)";
		}
		else {
			ctx.fillStyle = "black";
		}

		ctx.fillText(ch, start_pos.x + x, start_pos.y);
		x += ctx.measureText(ch).width;
	}
}