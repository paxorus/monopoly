const {getTimeNow} = require("../fickle/time-now.js");


function describeTimeSince(then) {
	const MINUTE = 60;
	const HOUR = 60 * MINUTE;
	const DAY = 24 * HOUR;
	const WEEK = 7 * DAY;
	const MONTH = 30 * DAY;
	const YEAR = 365 * DAY;

	const now = getTimeNow();
	const ageInSeconds = (now - then) / 1000;

	if (ageInSeconds < MINUTE) {
		return "a few seconds ago";
	}

	if (ageInSeconds < 2 * MINUTE) {
		return "over a minute ago";
	}

	if (ageInSeconds < HOUR) {
		const ageInMinutes = Math.floor(ageInSeconds / MINUTE);
		return `${ageInMinutes} minutes ago`;
	}

	if (ageInSeconds < 2 * HOUR) {
		return "over an hour ago";
	}

	if (ageInSeconds < DAY) {
		const ageInHours = Math.floor(ageInSeconds / HOUR);
		return `${ageInHours} hours ago`;
	}

	if (ageInSeconds < 2 * DAY) {
		return "over a day ago";
	}

	if (ageInSeconds < WEEK) {
		const ageInDays = Math.floor(ageInSeconds / DAY);
		return `${ageInDays} days ago`;
	}

	if (ageInSeconds < 2 * WEEK) {
		return "over a week ago";
	}

	if (ageInSeconds < MONTH) {
		const ageInWeeks = Math.floor(ageInSeconds / WEEK);
		return `${ageInWeeks} weeks ago`;
	}

	if (ageInSeconds < 2 * MONTH) {
		return "over a month ago";
	}

	if (ageInSeconds < YEAR) {
		const ageInMonths = Math.floor(ageInSeconds / MONTH);
		return `${ageInMonths} months ago`;
	}

	if (ageInSeconds < 2 * YEAR) {
		return "over a year ago";
	}

	const ageInYears = Math.floor(ageInSeconds / YEAR);
	return `${ageInYears} years ago`;
}

module.exports = {
	describeTimeSince
};