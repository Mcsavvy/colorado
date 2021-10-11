const { generateAbbr, ValueError } = require("../colorado");

describe("Testing the functions", () => {
  test("Testing the generateAbbr function", () => {
    const result = generateAbbr("black");
    expect(result).toEqual("bk");
    expect(result).toBeTruthy();
  });
  test("Testing the value error function", () => {
    expect(() => ValueError("rule", "class must contain <abbr>")).toThrow(
      Error
    );
  });
});
