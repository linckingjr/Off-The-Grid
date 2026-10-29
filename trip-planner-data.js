(function (root) {
  const data = {
    currency: "USD",
    regions: [
      {
        id: "region-pending",
        name: "Region not assigned · confirmation pending",
        verified: false,
        destinations: [
          {
            id: "shalom-matopo",
            name: "Shalom Matopo",
            status: "Draft · confirmation required",
            sourceEventId: "survival-camp",
            description: "Appears in an existing OTG draft event. Venue details, suitability, dates, and availability are not confirmed.",
            rate: { approved: false, amount: null, basis: null }
          },
          {
            id: "mana-pools-national-park",
            name: "Mana Pools National Park",
            status: "Draft · confirmation required",
            sourceEventId: "valentines-mana-pools",
            description: "Appears in an existing OTG draft event. Venue details, suitability, dates, and availability are not confirmed.",
            rate: { approved: false, amount: null, basis: null }
          },
          {
            id: "antelope-park",
            name: "Antelope Park",
            status: "Draft · confirmation required",
            sourceEventId: "valentines-antelope-park",
            description: "Appears in an existing OTG draft event. Venue details, suitability, dates, and availability are not confirmed.",
            rate: { approved: false, amount: null, basis: null }
          }
        ]
      }
    ],
    accommodations: [],
    activities: [],
    transportOptions: [
      {
        id: "own-vehicle",
        name: "Own vehicle / self-arranged",
        status: "Self-arranged; vehicle costs are not included in the estimate.",
        rate: null
      },
      {
        id: "ask-otg-transport",
        name: "Ask OTG about transport",
        status: "Transport offering, route, availability, and pricing require confirmation.",
        rate: { approved: false, amount: null, basis: null }
      }
    ],
    equipmentOptions: [],
    fees: []
  };

  function calculateLineItem(item, context) {
    const rate = item && item.rate ? item.rate : item;
    const values = context || {};
    if (!rate || rate.approved !== true || !Number.isFinite(rate.amount) || rate.amount < 0) {
      return { status: "pending", amount: null, reason: "Rate is not approved." };
    }

    let quantity;
    switch (rate.basis) {
      case "perPerson":
        quantity = values.travellers;
        break;
      case "perGroup":
        quantity = 1;
        break;
      case "perVehicle":
        quantity = values.vehicles;
        break;
      case "perTrip":
        quantity = values.trips === undefined ? 1 : values.trips;
        break;
      case "perKilometre":
        quantity = values.distanceKm;
        break;
      case "perNight":
        quantity = values.nights;
        break;
      case "perRoomNight":
        if (!Number.isFinite(values.travellers) || !Number.isFinite(rate.roomCapacity) || rate.roomCapacity < 1) {
          return { status: "pending", amount: null, reason: "Room capacity is not configured." };
        }
        quantity = Math.ceil(values.travellers / rate.roomCapacity) * values.nights;
        break;
      default:
        return { status: "pending", amount: null, reason: "A supported pricing basis is not configured." };
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      return { status: "pending", amount: null, reason: "A required quantity for this rate is missing." };
    }

    return {
      status: "confirmed",
      amount: Math.round(rate.amount * quantity * 100) / 100,
      basis: rate.basis,
      quantity
    };
  }

  function summarizeLines(lines, context) {
    let confirmedSubtotal = 0;
    const pending = [];
    const results = (lines || []).map((line) => {
      const calculation = calculateLineItem(line, context);
      if (calculation.status === "confirmed") {
        confirmedSubtotal += calculation.amount;
      } else {
        pending.push(line && line.name ? line.name : "Unpriced item");
      }
      return { name: line && line.name ? line.name : "Item", ...calculation };
    });

    confirmedSubtotal = Math.round(confirmedSubtotal * 100) / 100;
    return {
      lines: results,
      confirmedSubtotal,
      estimatedTotal: pending.length ? null : confirmedSubtotal,
      pending
    };
  }

  root.otgTripPlannerData = data;
  root.otgTripPlannerCalculator = { calculateLineItem, summarizeLines };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { data, calculateLineItem, summarizeLines };
  }
})(typeof window === "undefined" ? globalThis : window);
