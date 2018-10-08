
class InstallError extends Error {
    constructor({
        message = '',
        code = 1,
        project = null,
        error = null
    }) {
        super(message);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InstallError);
        }
        this.code = code;
        this.project = project;
        this.error = error;
    }
}

module.exports = InstallError;
