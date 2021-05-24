/**
 * API No. 7
 * API Name : 물품 등록 API (사진 미구현)
 * [POST] /app/items
 */
 exports.postItem = async function (req, res) {

    /**
     * Body: title
     * header: jwt token
     */

    const { mobile, nickname } = req.body;

    // 휴대전화 형식적 검증
    const mobileVerification = inputverifier.verifyMobile(mobile);
    if (!mobileVerification.isValid) return res.send(errResponse(mobileVerification.errorMessage));

    // 닉네임 형식적 검증
    const nicknameVerification = inputverifier.verifyNickname(nickname);
    if (!nicknameVerification.isValid) return res.send(errResponse(nicknameVerification.errorMessage));

    // DB에 회원정보 등록
    const signUpResponse = await userService.createUser(
        mobile,
        nickname
    );

    return res.send(signUpResponse);
};