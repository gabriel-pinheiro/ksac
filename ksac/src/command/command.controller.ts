import { injectable } from "inversify";
import { Controller } from "src/controller";

@injectable()
export class CommandController implements Controller {
    async registerCommands() { }
}
