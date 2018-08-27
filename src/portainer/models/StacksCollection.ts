import {Stack} from "./Stack";

export class StacksCollection {
    stacks: Map<number, Stack>;

    constructor(stacks: Object[]) {
        this.stacks = new Map<number, Stack>();

        stacks.forEach((stackObj => {
            const stack = new Stack(stackObj);
            this.stacks.set(stack.Id, stack);
        }));
    }

    /**
     * Search stack with presented name
     * @param name
     */
    public filterByName(name: string): Stack | null {
        const result = Array.from(this.stacks.values()).filter((stack) => stack.Name === name);
        if (result.length !== 1) {
            return null;
        }
        return result[0];
    }
}