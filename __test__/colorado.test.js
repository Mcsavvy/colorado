const { generateAbbr } = require("../colorado");

describe("Testing the functions", () => {
  it("Testing the generateAbbr function", () => {
    const result = generateAbbr("black");
    expect(result).toEqual("bk");
    expect(result).toBeTruthy();
  });
});
