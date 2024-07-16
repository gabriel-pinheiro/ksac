export abstract class Step {
    abstract run(): Promise<void>;
    abstract get description(): string;
}
