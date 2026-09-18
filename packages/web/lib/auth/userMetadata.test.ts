import { readFullNameFromMetadata } from "./userMetadata";

describe("readFullNameFromMetadata", () => {
  it("returns a trimmed full_name", () => {
    expect(readFullNameFromMetadata({ full_name: "  Lucas Lima  " })).toBe(
      "Lucas Lima",
    );
  });

  it("returns null when full_name is missing or blank", () => {
    expect(readFullNameFromMetadata(undefined)).toBeNull();
    expect(readFullNameFromMetadata({})).toBeNull();
    expect(readFullNameFromMetadata({ full_name: "   " })).toBeNull();
    expect(readFullNameFromMetadata({ full_name: 42 })).toBeNull();
  });
});
