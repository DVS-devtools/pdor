/**
 * @memberof LogLibrary
 * @function log
 * @description Log the given message on the console
 * @param {Object} options (see attributes below)
 * @param {String} [options.message=''] message to show
 * @returns void

 *
 * @example
 * // Log LogLibrary
 *  LogLibrary.log({
 *      message: 'hello'
 *  });
 */

export default (options) => {
    const newMessage = `${options.message} world`;
    console.log(newMessage); // eslint-disable-line no-console
};