module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },

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

    USERIDX_EMPTY : { "isSuccess": false, "code": 2012, "message": "userIdx값이 없습니다." },
    USERIDX_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    // Response error
    REDUNDANT_MOBILE : { "isSuccess": false, "code": 3001, "message":"중복된 휴대폰 번호입니다." },
    REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    OVERLAPPING_MOBILE : { "isSuccess": false, "code": 3003, "message": "입력한 전화번호로 가입한 회원이 여러 명입니다. 고객센터에 문의하세요." },
    INVALID_USER : { "isSuccess": false, "code": 3004, "message": "유효하지 않은 계정입니다. 고객센터에 문의하세요." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    
 
    // 형식적 검증 에러
    INPUT_VERIFIER_ERROR: { "isSuccess": false, "code": 5001, "message": "유효한 검증값이지만 에러가 발생했습니다. 서버개발자에게 연락주세요."}
}
