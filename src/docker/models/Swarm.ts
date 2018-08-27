export class Swarm {
    public CreatedAt!: string;
    public UpdatedAt!: string;
    public Spec!: Object;
    public Name!: string;
    public ID!: string;
    public Version!: {
        Index: number
    };

    constructor(data: Object) {
        Object.assign(this, data);
    }
}