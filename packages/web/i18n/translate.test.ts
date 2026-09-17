import { dictionaries } from "./messages";
import { translate } from "./translate";

describe("translate", () => {
  it("resolves keys for English", () => {
    expect(translate("en-US", "app.title")).toBe("Smart Pantry");
    expect(translate("en-US", "form.addItem")).toBe("Add item");
    expect(translate("en-US", "form.addNewItem")).toBe("Add new item");
    expect(translate("en-US", "modal.addItemTitle")).toBe("Add new item");
    expect(translate("en-US", "modal.removeItemTitle")).toBe("Remove item");
    expect(translate("en-US", "dashboard.heading")).toBe("Dashboard");
    expect(translate("en-US", "auth.signIn")).toBe("Sign in");
  });

  it("resolves keys for Portuguese", () => {
    expect(translate("pt-BR", "form.addItem")).toBe("Adicionar item");
    expect(translate("pt-BR", "form.addNewItem")).toBe("Adicionar novo item");
    expect(translate("pt-BR", "modal.cancel")).toBe("Cancelar");
    expect(translate("pt-BR", "modal.removeConfirm")).toBe("Remover");
    expect(translate("pt-BR", "inventory.empty")).toContain("despensa");
    expect(translate("pt-BR", "auth.signOut")).toBe("Sair");
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

    expect(
      translate("en-US", "modal.removeItemMessage", { name: "Olive oil" }),
    ).toBe('Are you sure you want to remove "Olive oil" from your pantry?');
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
