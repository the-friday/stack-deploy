export class Filter {
  filters: { [name: string]: Array<string> } = {};

  add(name: string, value: string): Filter {
    if (Array.isArray(this.filters[name])) {
      this.filters[name].push(value)
    } else {
      this.filters[name] = [value];
    }
    return this;
  }

  toString() {
    return JSON.stringify(this.filters);
  }
}