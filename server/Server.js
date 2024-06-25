'use-strict';

// 환경 변수 파일(.env) 로드
(require('dotenv')).config({ path: './.env' });
const Express = require('express');
const Helmet = require('helmet');
const XSS = require('xss-clean');
const Compression = require('compression');
const HPP = require('hpp');
const Cors = require('cors');
const SocketIO = require('socket.io');
const BootHelper = require('./Utilities/BootHelper');
const ChildProcess = require('child_process');
const Path = require('path');

// 전역 예외 처리 핸들러 설정
process.on('uncaughtException', (UncaughtServerError) => {
    console.error(UncaughtServerError);
    process.exit(1);
});

const GlobalErrorHandler = require('./Controllers/Error');
const Application = Express();
const Port = process.env.SERVER_PORT || 3333;
const Hostname = process.env.SERVER_HOST || '0.0.0.0';
const { HandleStreamedResponse } = require('./Controllers/Chat');
const { VersionChecker } = require('./Tools/GPT');

// 어플리케이션에 표준화된 바인딩 적용
BootHelper.StandarizedBindingToApplication({
    Application,
    Suffix: '/api/v1/',
    Routes: [
        'Chat'
    ],
    Middlewares: [
        Helmet,
        [Cors, [ { origin: process.env.CORS_ORIGIN } ]],
        [Express.json, [ { limit: process.env.BODY_MAX_SIZE || '10kb' } ]],
        Compression,
        HPP,
        XSS,
    ],
    Settings: {
        Deactivated: [
            'x-powered-by'
        ]
    }
});

// 정적 파일 제공을 위한 설정 추가
Application.use(Express.static(Path.join(__dirname, '../client/dist')));

// 루트 경로에 대한 요청 처리
Application.get('/', function(req, resp) {
    resp.sendFile(Path.join(__dirname, '../client/dist/index.html'));
});

// 모든 경로에 대한 요청 처리
Application.get('*', function(req, resp) {
    resp.sendFile(Path.join(__dirname, '../client/dist/index.html'));
});

// 모든 경로('*')에 대한 요청을 처리하는 미들웨어 함수
Application.all('*', (Request, Response) => {
    // 요청 경로가 '/api/v1/'로 시작하는지 확인
    if(Request.path.startsWith('/api/v1/')){
        // API 요청이지만 유효하지 않은 경우 404 에러 응답
        return Response.status(404).json({
            Status: 'Error',
            Data: {
                Message: 'INVALID_API_REQUEST',
                URL: Request.originalUrl
            }
        });
    }
    // API 요청이 아닌 경우 클라이언트 호스트로 리다이렉트
    Response.redirect(process.env.CLIENT_HOST);
});

// 전역 에러 핸들러 적용
Application.use(GlobalErrorHandler);

// HTTP 서버 인스턴스 가져오기
const WebServer = BootHelper.GetConfiguredHTTPServerInstance(Application);

// Socket.IO 구성 및 스트리밍 응답 처리
HandleStreamedResponse(SocketIO(WebServer, { cors: { origin: process.env.CORS_ORIGIN } }));

// 서버 시작
WebServer.listen(Port, () => {
    // 주기적으로 패키지 버전을 확인하고 업데이트
    setInterval(async () => {
        try {
            const Response = await VersionChecker();
            if (Response === 'UP_TO_DATE')
                return; // 버전이 최신인 경우 아무 작업도 수행하지 않음
            // g4f 패키지 업데이트
            ChildProcess.spawn('pip', ['install', '-U', 'g4f']);
        } catch (VersionUpdateError) {
            console.warn(VersionUpdateError);
        }
    }, 1000 * 60 * process.env.TIME_FOR_CHECK_AND_UPDATE_PACKAGES); // 환경 변수에 설정된 시간 간격으로 실행

    // 서버 시작 시 성공 메시지 로그
    console.log(`Server started successfully on port ${Port}.`);
});

// 전역 Promise 거부 처리 핸들러 설정
process.on('unhandledRejection', (UnhandledServerError) => {
    console.warn(UnhandledServerError);
    WebServer.close(() => process.exit(1));
});
