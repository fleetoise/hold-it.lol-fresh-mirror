export function wait(duration = 0) {
    return new Promise(function(resolve) {
        setTimeout(resolve, duration);
    });
}
