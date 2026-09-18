import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  paginateItems,
} from "./paginateItems";

describe("paginateItems", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("returns the first page by default sizing", () => {
    const result = paginateItems(items, 1);

    expect(result.pageSize).toBe(DEFAULT_INVENTORY_PAGE_SIZE);
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.totalPages).toBe(2);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.hasNextPage).toBe(true);
  });

  it("returns later pages and clamps out-of-range requests", () => {
    expect(paginateItems(items, 2).items).toEqual([7, 8, 9, 10]);
    expect(paginateItems(items, 99).page).toBe(2);
    expect(paginateItems(items, 0).page).toBe(1);
  });

  it("handles an empty list without next/previous pages", () => {
    const result = paginateItems([], 3, 6);

    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 6,
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });

  it("uses a custom page size", () => {
    const result = paginateItems(items, 2, 4);

    expect(result.items).toEqual([5, 6, 7, 8]);
    expect(result.totalPages).toBe(3);
    expect(result.hasPreviousPage).toBe(true);
    expect(result.hasNextPage).toBe(true);
  });
});
