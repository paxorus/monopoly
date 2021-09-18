const assert = require("assert");
const {describeTimeSince, _overrideNow, _unoverrideNow} = require("../age-to-text-helper.js")

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
			_overrideNow(nowInMillis);

			assert.equal("a few seconds ago", describeTimeSince(nowInMillis + SECOND));

			_unoverrideNow();
		});

		it("should round down when describing the time", () => {
			const nowInMillis = +new Date();
			_overrideNow(nowInMillis);

			assert.equal("a few seconds ago", describeTimeSince(nowInMillis - SECOND));
			assert.equal("a few seconds ago", describeTimeSince(nowInMillis - MINUTE + 1));

			assert.equal("over a minute ago", describeTimeSince(nowInMillis - MINUTE));
			assert.equal("over a minute ago", describeTimeSince(nowInMillis - 1.5 * MINUTE));
			assert.equal("2 minutes ago", describeTimeSince(nowInMillis - 2 * MINUTE));
			assert.equal("59 minutes ago", describeTimeSince(nowInMillis - HOUR + 1));
			
			assert.equal("over an hour ago", describeTimeSince(nowInMillis - HOUR));
			assert.equal("over an hour ago", describeTimeSince(nowInMillis - 1.5 * HOUR));
			assert.equal("2 hours ago", describeTimeSince(nowInMillis - 2 * HOUR));
			assert.equal("23 hours ago", describeTimeSince(nowInMillis - DAY + 1));

			assert.equal("over a day ago", describeTimeSince(nowInMillis - DAY));
			assert.equal("over a day ago", describeTimeSince(nowInMillis - 1.5 * DAY));
			assert.equal("2 days ago", describeTimeSince(nowInMillis - 2 * DAY));
			assert.equal("6 days ago", describeTimeSince(nowInMillis - WEEK + 1));

			assert.equal("over a week ago", describeTimeSince(nowInMillis - WEEK));
			assert.equal("over a week ago", describeTimeSince(nowInMillis - 1.5 * WEEK));
			assert.equal("2 weeks ago", describeTimeSince(nowInMillis - 2 * WEEK));
			assert.equal("4 weeks ago", describeTimeSince(nowInMillis - MONTH + 1));

			assert.equal("over a month ago", describeTimeSince(nowInMillis - MONTH));
			assert.equal("over a month ago", describeTimeSince(nowInMillis - 1.5 * MONTH));
			assert.equal("2 months ago", describeTimeSince(nowInMillis - 2 * MONTH));
			// Artifact of assuming a month is just 30 days.
			assert.equal("12 months ago", describeTimeSince(nowInMillis - YEAR + 1));

			assert.equal("over a year ago", describeTimeSince(nowInMillis - YEAR));
			assert.equal("over a year ago", describeTimeSince(nowInMillis - 1.5 * YEAR));
			assert.equal("2 years ago", describeTimeSince(nowInMillis - 2 * YEAR));
			assert.equal("50 years ago", describeTimeSince(nowInMillis - 50 * YEAR));

			_unoverrideNow();
		});
	});
});