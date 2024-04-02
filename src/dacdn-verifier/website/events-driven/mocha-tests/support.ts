import { log } from "../../../../log";
log.verbose('Executing Support File');
beforeEach(function () {
    //@ts-ignore
    this.window = global.jsDomWindow
    log.verbose('BeforeEach: Support File');
})