const assert = require("assert");
require("../array-monkey-patch.js");

describe("Array Monkey Patch", () => {

	describe("#remove()", () => {
		it("removes a number from the middle of the array", () => {
			const array = [1, 2, 3, 4];
			array.remove(3);
			assert.deepEqual(array, [1, 2, 4]);
		});

		it("removes a number from the end of the array", () => {
			const array = [1, 2, 3, 4];
			array.remove(4);
			assert.deepEqual(array, [1, 2, 3]);
		});

		it("removes a number from the beginning of the array", () => {
			const array = [1, 2, 3, 4];
			array.remove(1);
			assert.deepEqual(array, [2, 3, 4]);
		});

		it("removes only the first occurrence of an object from the array", () => {
			const object = {};
			const array = [object, {a: 10}, object, object];
			array.remove(object);
			assert.deepEqual(array, [{a: 10}, {}, {}]);
		});

		it("removes objects by reference from the array", () => {
			const item1 = {a: 10};
			const item2 = {a: 10};
			const item3 = {a: 10};
			const array = [item1, item2, item3];
			array.remove(item2);

			assert.equal(array.length, 2);
			assert.equal(array[0], item1);
			assert.equal(array[1], item3);
		});

		it("exits silently if the item is not in the array", () => {
			const array = [1, 2, 3, 4];
			array.remove(5);
			assert.deepEqual(array, [1, 2, 3, 4]);
		});
	});
});