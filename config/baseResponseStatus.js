module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },



    //Request error
    // 회원 정보 입력 관련
    MOBILE_EMPTY : { "isSuccess": false, "code": 2001, "message":"휴대폰 번호를 입력 해주세요." },
    MOBILE_LENGTH : { "isSuccess": false, "code": 2002, "message":"휴대폰 번호는 10~11자리로 입력 해주세요." },
    MOBILE_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"휴대폰 형식을 정확하게 입력해주세요." },
    
    VERIFICATION_CODE_EMPTY : { "isSuccess": false, "code": 2004, "message":"휴대폰 인증번호를 입력 해주세요." },
    VERIFICATION_CODE_LENGTH : { "isSuccess": false, "code": 2005, "message":"휴대폰 인증번호는 4자리로 입력 해주세요." },
    VERIFICATION_CODE_ERROR_TYPE : { "isSuccess": false, "code": 2006, "message":"휴대폰 인증번호를 숫자로만 입력해주세요." },
    VERIFICATION_CODE_NOT_MATCH : { "isSuccess": false, "code": 2007, "message":"휴대폰 인증번호가 일치하지 않습니다." },
    
    NICKNAME_EMPTY : { "isSuccess": false, "code": 2008, "message":"닉네임을 입력 해주세요." },
    NICKNAME_LENGTH : { "isSuccess": false,"code": 2009,"message":"닉네임은 최대 10자리를 입력해주세요." },

    USERIDX_EMPTY : { "isSuccess": false, "code": 2010, "message":"JWT 토큰에 userIdx가 존재하지 않습니다." },
    USERIDX_NaN : { "isSuccess": false,"code": 2011,"message":"JWT 토큰의 userIdx가 숫자가 아닙니다." },

    // Response error
    REDUNDANT_MOBILE : { "isSuccess": false, "code": 3001, "message":"중복된 휴대폰 번호입니다." },
    REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    OVERLAPPING_MOBILE : { "isSuccess": false, "code": 3003, "message": "입력한 전화번호로 가입한 회원이 여러 명입니다. 고객센터에 문의하세요." },
    INVALID_USER : { "isSuccess": false, "code": 3004, "message": "유효하지 않은 계정입니다. 고객센터에 문의하세요." },

    USER_NOT_EXIST : { "isSuccess": false, "code": 3005, "message": "존재하지 않는 회원입니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    
 
    // 형식적 검증 에러
    INPUT_VERIFIER_ERROR: { "isSuccess": false, "code": 5001, "message": "유효한 검증값이지만 에러가 발생했습니다. 서버개발자에게 연락주세요."},
    // JWT 토큰 관련
    TOKEN_EMPTY : { "isSuccess": false, "code": 5002, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 5003, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 5004, "message":"JWT 토큰 검증 성공" }

}
