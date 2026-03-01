// spyder_data.js
// Simple param file for the "Spyder-like" training asset model.
// This is NOT an accurate military model — it's a blocky training prop for your assignment/game.

(() => {
  window.SPYDER_DATA = {
    // Dimensions are in "world units" (metres-ish).
    truck: {
      length: 6.6,
      width:  2.6,
      height: 2.3,
      cabLength: 2.4,
      bedLength: 4.2,
      wheelRadius: 0.55,
      wheelWidth:  0.35,
    },

    launcher: {
      baseLength: 2.0,
      baseWidth:  1.8,
      baseHeight: 0.5,
      elevationDeg: 35,
      packLength:  2.6,
      packWidth:   1.8,
      packHeight:  0.9,
      tubeCount: 8,
    },

    ladder: {
      height: 2.0,
      width:  0.35,
      depth:  0.12,
      rungCount: 6,
    },

    flaps: {
      width:  0.7,
      height: 0.25,
      depth:  0.05,
    },

    extinguisher: {
      // Example service date you mentioned.
      // Logic: if TODAY is >= (serviceDate + 1 year) => unserviceable
      serviceDateISO: "2025-02-20",
    }
  };
})();
