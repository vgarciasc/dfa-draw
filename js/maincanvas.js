var fps = 60;
var canvas, context;

var selectedState = {id: -1, selecting: false, hovering: false, moving: false, adding_transition: false};
var selectedTransition = {id: -1};

var runInfo = {nowRunning: false, transitionID: null, stateID: null, input: null, currentChar: null};

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
}

function draw() {
	cleanCanvas();

	for (var i = 0; i < transitionList.length; i++) {
		drawTransition(context, transitionList[i]);
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
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillText("I ==>",
			state.coord.x - state.radius,
			state.coord.y);
	}
}

function drawStateID(ctx, state) {
	setFillingSymbol(ctx, null);

	ctx.font = "15px Georgia";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillText(state.id,
		state.coord.x,
		state.coord.y);
}

function setStateColor(ctx, state) {
	setFillingSymbol(ctx, null);

	if (runInfo.nowRunning && runInfo.stateID == state.id) {
		ctx.fillStyle = "rgb(108, 182, 196)";
		return;
	}

	if (isSelected(state)) {
		if (selectedState.adding_transition) {
			ctx.fillStyle = "rgb(86, 217, 1)";
		}
		else {
			ctx.fillStyle = "rgb(247, 170, 2)";
		}
	}
	else {
		ctx.fillStyle = "rgb(255, 245, 85)";
	}
}

function setStateStroke(ctx, state) {
	setFillingSymbol(ctx, null);

	ctx.lineWidth = 2;
	
	if (runInfo.nowRunning && runInfo.stateID == state.id) {
		ctx.strokeStyle = "rgb(42, 114, 157)";
		return;
	}

	ctx.strokeStyle = "rgb(187, 128, 0)";
}

function drawTransition(ctx, tr) {
	setFillingSymbol(ctx, tr);

	setTransitionColor(ctx, tr);

	if (tr.state_src.id == tr.state_dst.id) {
		drawTransitionCircle(ctx, tr);
	}
	else {
		drawTransitionOver(ctx, tr);
	}
}

function setTransitionColor(ctx, tr) {
	setFillingSymbol(ctx, tr);

	if (runInfo.nowRunning && runInfo.transitionID == tr.id) {
		ctx.strokeStyle = ctx.fillStyle = "rgb(42, 114, 157)";
		return;
	}

	if (hoveredTransition != null && hoveredTransition.id == tr.id &&
		!runInfo.nowRunning) {
		ctx.strokeStyle = ctx.fillStyle = "rgb(181, 111, 0)";
	}
	else {
		ctx.strokeStyle = ctx.fillStyle = "rgb(0, 0, 0)";
	}
}

function setFillingSymbol(ctx, tr) {
	if (selectedTransition.id != -1) {
		if (tr != null && tr.id == selectedTransition.id) {
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

	if (possiblePlace.topleft) {
		center = new coord(tr.state_src.coord.x - radius,
			tr.state_src.coord.y - radius);

		arrow_p1 = new coord(tr.state_src.coord.x,
			tr.state_src.coord.y - radius);
		arrow_p2 = new coord(arrow_p1.x - radius / 3 - 2,
			arrow_p1.y - radius / 2);
		arrow_p3 = new coord(arrow_p1.x + radius / 3 - 3,
			arrow_p1.y - radius / 2 - 3);
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
	ctx.font = "20px Georgia";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillText(tr.symbols,
		center.x - radius - 2,
		center.y - radius / 2);
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

	ctx.lineWidth = 3;
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

	//symbol
	ctx.font = "20px Georgia";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(tr.symbols,
		arrow_pt.x,
		arrow_pt.y);
}

function bezcurve(start, coord1, coord2, end) {
	var curve = [];
	curve.push(start);
	curve.push(coord1);
	curve.push(coord2);
	curve.push(end);
	this.curve = curve;
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
			ctx.fillStyle = "rgb(208, 194, 158)";
		}
		else {
			ctx.fillStyle = "black";
		}

		ctx.fillText(ch, start_pos.x + x, start_pos.y);
		x += ctx.measureText(ch).width;
	}
}