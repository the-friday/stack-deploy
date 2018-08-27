export type CommandArg = {
    name: string;
    type: any;
    description: string;
    group?: string;
    typeLabel?: string
    defaultValue?: any;
}

export abstract class Command {
    name: string = '';
    description: string = '';
    example: string = '';
    args: Array<CommandArg> = [];

    async run(args?: string[]) {
        throw new Error('Implement me');
    }

    getHelp() {
        throw new Error('Help for current command is not implemented');
    }

    emptyArguments(requiredArgs: { [propname: string]: any }): string[] | null {
        const required = this.getRequiredArgs();
        if (Object.keys(requiredArgs).length !== required.length) {
            const filledFields = Object.keys(requiredArgs);
            return required.filter(field => filledFields.indexOf(field) === -1);
        }

        return null;
    }

    /**
     * Required args
     * @return {*|Array}
     */
    getRequiredArgs(): Array<string> {
        return this.args.reduce((acc: Array<string>, value: CommandArg) => {
            if (value.group === 'required') {
                acc.push(value.name);
            }
            return acc;
        }, []);
    }
}