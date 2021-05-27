const lpad = function(str, padLen, padStr) {
    if (padStr.length > padLen) {
        console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
        return str;
    }
    str += ""; // 문자로
    padStr += ""; // 문자로
    while (str.length < padLen)
        str = padStr + str;
    str = str.length >= padLen ? str.substring(0, padLen) : str;
    return str;
}

exports.arrayToString = function(array) {
    let str = ""
    for (word of array) {
        str += '"'
        str += word
        str += '"'
        str += ","
    }
    str = str.slice(0, -1)
    return str
}

exports.makeCursor = function(unixTimestamp, idx) {
    if(!unixTimestamp) {
        return "999999999999999999999999999999"
    } else {
        const cursor1 = lpad(unixTimestamp.unixTimestamp, 15, 0)
        const cursor2 = lpad(idx, 15, 0)
        return cursor1 + cursor2
    }     
};