/* HoverTxt - Start */
var HTIntervalID = 0;
$(document).on(":passagerender", function (ev) {
	UpdateHoverTxt(ev.content);
});
$(window).on("resize scroll", function (ev) {
	clearInterval(HTIntervalID);
	HTIntervalID = setInterval(UpdateHoverTxt, 300);
});
$("#ui-bar-toggle").on("click", function (ev) {
	clearInterval(HTIntervalID);
	HTIntervalID = setInterval(UpdateHoverTxt, 300);
});
/* Waits for passage to be fully rendered before doing anything. */
function UpdateHoverTxt(Container) {
	if (typeof Container === "undefined") {
		Container = document;
	}
	if (Engine.isIdle()) {
		clearInterval(HTIntervalID);
		var i = 1, sum, positionInfo, element = Container.getElementById("hoverTxt" + i);
		while (element !== null) {
			positionInfo = element.getBoundingClientRect();  /* Refresh rect */
			element.style.left = ((Math.round(positionInfo.width / 2) - 11) * -1) + "px";  // Center hoverTxt horizontally over icon.
			element.style.top = (-1 * parseInt(positionInfo.height) - 3) + "px";  // Position bottom of hoverTxt just above the icon.
			positionInfo = element.getBoundingClientRect();  /* Refresh rect */
			sum = Math.round(positionInfo.top + positionInfo.height + 5);
			if (sum > window.innerHeight) {  /* Make sure the text isn't outside the bottom of the screen. */
				element.style.top = (parseInt(element.style.top) + window.innerHeight - sum) + "px";
				positionInfo = element.getBoundingClientRect();  /* Refresh rect */
			}
			if (positionInfo.top < 5) {  /* Make sure the text isn't outside the top of the screen. */
				element.style.top = (parseInt(element.style.top) - positionInfo.top + 5) + "px";
			}
			sum = Math.round(positionInfo.left + positionInfo.width + 26);
			if (sum > window.innerWidth) {  /* Make sure the text isn't outside the right of the screen. */
				element.style.left = (parseInt(element.style.left) + window.innerWidth - sum) + "px";
				positionInfo = element.getBoundingClientRect();  /* Refresh rect */
			}
			if (positionInfo.left + window.pageXOffset < 10) {  /* Make sure the text isn't outside the left of the screen. */
				element.style.left = (parseInt(element.style.left) - positionInfo.left - window.pageXOffset + 10) + "px";
			}
			element = document.getElementById("hoverTxt" + (++i));
		}
	} else {
		clearInterval(HTIntervalID);
		HTIntervalID = setInterval(UpdateHoverTxt, 300);
	}
}
/* HoverTxt - End */