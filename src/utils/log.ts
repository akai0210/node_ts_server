import util from 'util';

const _util = util;

export class Log {

    private static _instance: Log;

    public static get Instance(): Log {
        if (!Log._instance) {
            Log._instance = new Log();
        }
        return Log._instance;
    }

    /**log颜色 */
    private Log_Color: { RESET: String, INFO: String, WARN: String, ERROR: String } = {
        RESET: '\u001b[0m',
        INFO: '\u001b[32m', // green
        WARN: '\u001b[33m', // yellow
        ERROR: '\u001b[31m' // red
    }

    private _globalLevel: Level = Level.All;

    //whether log output should be colored
    private _coloredOutPut: boolean = true;

    public setLevel(level: Level) {
        this._globalLevel = level;
    }

    public setColoredOutPut(bool: boolean) {
        this._coloredOutPut = bool;
    }

    public Info(): void {
        if (Level.INFO === this._globalLevel) {
            //写入信息
            this.log(Level.INFO, _util.format.apply(this, arguments as any));
        }
    }

    public Warn(): void {
        if (Level.ERROR === this._globalLevel) {
            this.log(Level.WARN, _util.format.apply(this, arguments as any));
        }
    }

    public Error(): void {
        if (Level.ERROR === this._globalLevel) {
            this.log(Level.ERROR, _util.format.apply(this, arguments as any));
        }
    }

    public newPrepareStackTrace(error, structuredStack) {
        return structuredStack;
    }

    public log(level, ...message): void {
        const oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = this.newPrepareStackTrace;
        let _structuredStack: any = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;
        let _caller = _structuredStack[2];

        const _lineSep: String = process.platform == 'win32' ? '\\' : '/';
        const _fileNameSplited: String = _caller.getFileName().split(_lineSep);
        const _fileName: String = _fileNameSplited[_fileNameSplited.length - 1];
        const _lineNumber: number = _caller.getLineNumber();
        const _columnNumber: number = _caller.getColumnNumber();

        let _levelString: String = "";
        switch (level) {
            case Level.INFO:
                _levelString = `[INFO]`;
                break;
            case Level.WARN:
                _levelString = '[WARN]';
                break;
            case Level.ERROR:
                _levelString = '[ERROR]';
                break;
            default:
                _levelString = '[]';
                break;
        }

        const _output = _util.format('%s %s(%d,%d) %s',
            _levelString, _fileName, _lineNumber, _columnNumber, message
        );

        if (!this._coloredOutPut) {
            process.stdout.write(_output + '\n');
        } else {
            switch (level) {
                case Level.INFO:
                    process.stdout.write(this.Log_Color.INFO + _output + this.Log_Color.RESET + '\n');
                    break;
                case Level.WARN:
                    process.stdout.write(this.Log_Color.WARN + _output + this.Log_Color.WARN + '\n');
                    break;
                case Level.ERROR:
                    process.stdout.write(this.Log_Color.ERROR + _output + this.Log_Color.ERROR + '\n');
                    break;
                default:
                    break;
            }
        }

    }

}

export enum Level {
    All = Infinity,
    INFO = 3,
    WARN = 2,
    ERROR = 1,
    NONE = -Infinity,
}

