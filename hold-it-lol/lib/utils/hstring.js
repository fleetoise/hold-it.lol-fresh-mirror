export function testRegex(str, re) {
    const match = str.match(re);
    return match !== null && match[0] == match.input;
}

export function fixTagNesting(text) {
    const REGEX_TAG = /\[#[^/[\]]*?\]$/
    const REGEX_COLOR_TAG = /\[#\/[0-9a-zA-Z]*?\]$/
    const REGEX_UNCOLOR_TAG = /\[\/#\]$/

    let newText = "";
    let inColorTag = false;
    let currentColorTag = "";
    let nestedColorTags = [];

    for (let char of text) {
        newText += char;
        if (newText.match(REGEX_COLOR_TAG)) {
            if (!inColorTag) {
                inColorTag = true;
            } else {
                nestedColorTags.push(currentColorTag);
                newText = newText.replace(REGEX_COLOR_TAG, "[/#]$&");
            }
            currentColorTag = newText.match(REGEX_COLOR_TAG)[0];
        } else if (inColorTag && newText.match(REGEX_TAG)) {
            newText = newText.replace(REGEX_TAG, "[/#]" + "$&" + currentColorTag);
        } else if (newText.match(REGEX_UNCOLOR_TAG)) {
            if (nestedColorTags.length > 0) {
                currentColorTag = nestedColorTags.pop();
                newText = newText.replace(REGEX_UNCOLOR_TAG, "$&" + currentColorTag);
            } else {
                inColorTag = false;
            }
        }
    }
    return newText
}
