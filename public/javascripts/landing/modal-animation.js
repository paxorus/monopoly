function animate({steps, durationMs, styles, then}) {
	function _animate(step) {
		styles.forEach(({element, property, from, to, format}) => {
			const styleValue = (to - from) / steps * step + from;
			const formattedStyleValue = format ? format(styleValue) : styleValue;
			element.css(property, formattedStyleValue);
		});

		if (step < steps) {
			setTimeout(() => _animate(step + 1), durationMs / steps);
		} else {
			if (then) {
				then();
			}
		}
	}

	_animate(0);
}

function openModal({modal, overlay, container}) {
	overlay.css("z-index", 2);
	modal.css("display", "block");

	animate({
		steps: 10,
		durationMs: 50,
		styles: [
			{element: overlay, property: "opacity", from: 0, to: 0.8},
			{element: container, property: "filter", from: 0, to: 10, format: num => `blur(${num}px)`},
			{element: modal, property: "top", from: 100, to: 20, format: num => `${num}%`}
		]
	});
}

function closeModal({modal, overlay, container}) {
	animate({
		steps: 10,
		durationMs: 50,
		styles: [
			{element: overlay, property: "opacity", from: 0.8, to: 0},
			{element: container, property: "filter", from: 10, to: 0, format: num => `blur(${num}px)`},
			{element: modal, property: "top", from: 20, to: -50, format: num => `${num}%`}
		],
		then: () => {
			overlay.css("z-index", -1);
			modal.css("display", "none");
		}
	});
}


export {
	openModal,
	closeModal
};