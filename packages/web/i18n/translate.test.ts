import { dictionaries } from "./messages";
import { translate } from "./translate";

describe("translate", () => {
  it("resolves keys for English", () => {
    expect(translate("en-US", "app.title")).toBe("Smart Pantry");
    expect(translate("en-US", "form.addItem")).toBe("Add item");
  });

  it("resolves keys for Portuguese", () => {
    expect(translate("pt-BR", "form.addItem")).toBe("Adicionar item");
    expect(translate("pt-BR", "inventory.empty")).toContain("despensa");
  });

  it("interpolates params", () => {
    expect(
      translate("en-US", "inventory.countFiltered", {
        filtered: 2,
        total: 5,
      }),
    ).toBe("2 of 5 items");

    expect(translate("pt-BR", "item.removeAria", { name: "Leite" })).toBe(
      "Remover Leite",
    );
  });

  it("leaves unknown placeholders intact", () => {
    expect(translate("en-US", "inventory.countMany", {})).toBe("{count} items");
  });

  it("keeps English and Portuguese dictionaries in sync", () => {
    const englishKeys = Object.keys(dictionaries["en-US"]).sort();
    const portugueseKeys = Object.keys(dictionaries["pt-BR"]).sort();

    expect(portugueseKeys).toEqual(englishKeys);
  });
});
