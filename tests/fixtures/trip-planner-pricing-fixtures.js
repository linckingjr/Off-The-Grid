module.exports = {
  context: {
    travellers: 3,
    nights: 2,
    vehicles: 2,
    trips: 1,
    distanceKm: 90
  },
  perPerson: { name: "Per person", rate: { approved: true, amount: 20, basis: "perPerson" } },
  perGroup: { name: "Per group", rate: { approved: true, amount: 75, basis: "perGroup" } },
  perVehicle: { name: "Per vehicle", rate: { approved: true, amount: 60, basis: "perVehicle" } },
  perTrip: { name: "Per trip", rate: { approved: true, amount: 110, basis: "perTrip" } },
  perKilometre: { name: "Per kilometre", rate: { approved: true, amount: 0.75, basis: "perKilometre" } },
  perRoomNight: {
    name: "Per room-night",
    rate: { approved: true, amount: 50, basis: "perRoomNight", roomCapacity: 2 }
  },
  pending: { name: "Unapproved", rate: { approved: false, amount: 999, basis: "perPerson" } }
};
