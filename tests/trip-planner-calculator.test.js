const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateLineItem, summarizeLines, data } = require("../trip-planner-data.js");
const fixtures = require("./fixtures/trip-planner-pricing-fixtures.js");

test("calculates approved rates using their configured charge basis", () => {
  const cases = [
    [fixtures.perPerson, 60],
    [fixtures.perGroup, 75],
    [fixtures.perVehicle, 120],
    [fixtures.perTrip, 110],
    [fixtures.perKilometre, 67.5],
    [fixtures.perRoomNight, 200]
  ];

  for (const [item, expected] of cases) {
    assert.deepEqual(calculateLineItem(item, fixtures.context), {
      status: "confirmed",
      amount: expected,
      basis: item.rate.basis,
      quantity: item.rate.basis === "perPerson" ? 3
        : item.rate.basis === "perGroup" ? 1
          : item.rate.basis === "perVehicle" ? 2
            : item.rate.basis === "perTrip" ? 1
              : item.rate.basis === "perKilometre" ? 90
                : 4
    });
  }
});

test("does not calculate unapproved rates or missing quantities", () => {
  assert.equal(calculateLineItem(fixtures.pending, fixtures.context).status, "pending");
  assert.equal(calculateLineItem(fixtures.perKilometre, { ...fixtures.context, distanceKm: undefined }).status, "pending");
  assert.equal(calculateLineItem(fixtures.perRoomNight, { travellers: 3 }).status, "pending");
});

test("keeps estimates pending when any selected line is unapproved", () => {
  const summary = summarizeLines([fixtures.perPerson, fixtures.pending], fixtures.context);
  assert.equal(summary.confirmedSubtotal, 60);
  assert.equal(summary.estimatedTotal, null);
  assert.deepEqual(summary.pending, ["Unapproved"]);
});

test("live catalogue contains no unapproved costs presented as approved", () => {
  assert.equal(data.accommodations.length, 0);
  assert.equal(data.activities.length, 0);
  assert.equal(data.fees.length, 0);
  assert.ok(data.regions.flatMap((region) => region.destinations).every((destination) => destination.rate.approved === false));
  assert.ok(data.transportOptions.every((option) => !option.rate || option.rate.approved === false));
});
