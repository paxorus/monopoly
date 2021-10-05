const assert = require("assert");
const {describeTimeSince} = require("../../friendliness/age-to-text-helper.js");
const TimeNow = require("../../fickle/time-now.js");


describe("Age to Text Helper", () => {

	const SECOND = 1000;
	const MINUTE = 60 * SECOND;
	const HOUR = 60 * MINUTE;
	const DAY = 24 * HOUR;
	const WEEK = 7 * DAY;
	const MONTH = 30 * DAY;
	const YEAR = 365 * DAY;

	describe("#describeTimeSince()", () => {
		it("should describe times in the future as a few seconds ago", () => {
			const nowInMillis = +new Date();
			TimeNow._inject(nowInMillis);

			assert.equal(describeTimeSince(nowInMillis + SECOND), "a few seconds ago");
		});

		it("should round down when describing the time", () => {
			const nowInMillis = +new Date();
			TimeNow._inject(nowInMillis);

			assert.equal(describeTimeSince(nowInMillis - SECOND), "a few seconds ago");
			assert.equal(describeTimeSince(nowInMillis - MINUTE + 1), "a few seconds ago");

			assert.equal(describeTimeSince(nowInMillis - MINUTE), "over a minute ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * MINUTE), "over a minute ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * MINUTE), "2 minutes ago");
			assert.equal(describeTimeSince(nowInMillis - HOUR + 1), "59 minutes ago");
			
			assert.equal(describeTimeSince(nowInMillis - HOUR), "over an hour ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * HOUR), "over an hour ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * HOUR), "2 hours ago");
			assert.equal(describeTimeSince(nowInMillis - DAY + 1), "23 hours ago");

			assert.equal(describeTimeSince(nowInMillis - DAY), "over a day ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * DAY), "over a day ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * DAY), "2 days ago");
			assert.equal(describeTimeSince(nowInMillis - WEEK + 1), "6 days ago");

			assert.equal(describeTimeSince(nowInMillis - WEEK), "over a week ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * WEEK), "over a week ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * WEEK), "2 weeks ago");
			assert.equal(describeTimeSince(nowInMillis - MONTH + 1), "4 weeks ago");

			assert.equal(describeTimeSince(nowInMillis - MONTH), "over a month ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * MONTH), "over a month ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * MONTH), "2 months ago");
			// Artifact of assuming a month is just 30 days.
			assert.equal(describeTimeSince(nowInMillis - YEAR + 1), "12 months ago");

			assert.equal(describeTimeSince(nowInMillis - YEAR), "over a year ago");
			assert.equal(describeTimeSince(nowInMillis - 1.5 * YEAR), "over a year ago");
			assert.equal(describeTimeSince(nowInMillis - 2 * YEAR), "2 years ago");
			assert.equal(describeTimeSince(nowInMillis - 50 * YEAR), "50 years ago");
		});
	});
});