

'use-strict';

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

process.on('uncaughtException', (UncaughtServerError) => {
    console.error(UncaughtServerError);
    process.exit(1);
});

const GlobalErrorHandler = require('./Controllers/Error');
const Application = Express();
const Port = process.env.SERVER_PORT || 3334;
const Hostname = process.env.SERVER_HOST || '0.0.0.0';
const { HandleStreamedResponse } = require('./Controllers/Chat');
const { VersionChecker } = require('./Tools/GPT');

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
        })
    }
    // API 요청이 아닌 경우 클라이언트 호스트로 리다이렉트
    Response.redirect(process.env.CLIENT_HOST);
});

// 전역 에러 핸들러 적용
Application.use(GlobalErrorHandler);

// Get the configured HTTP server instance
const WebServer = BootHelper.GetConfiguredHTTPServerInstance(Application);

// Configure Socket.IO and handle streamed responses
HandleStreamedResponse(SocketIO(WebServer, { cors: { origin: process.env.CORS_ORIGIN } }));

// Start the server
WebServer.listen(Port, () => {
    // Periodically check and update the package version
    setInterval(async () => {
        try{
            const Response = await VersionChecker();
            if(Response === 'UP_TO_DATE')
                return; // If the version is up-to-date, do nothing
            // Update the g4f package
            ChildProcess.spawn('pip', ['install', '-U', 'g4f']);
        }catch(VersionUpdateError){
            console.warn(VersionUpdateError);
        }
    }, 1000 * 60 * process.env.TIME_FOR_CHECK_AND_UPDATE_PACKAGES); // Run every X minutes, as set in the environment variable

    // Log a success message when the server starts
    console.log(`Server started successfully on port ${Port}.`);
});

// // 설정된 HTTP 서버 인스턴스 가져오기
// const WebServer = BootHelper.GetConfiguredHTTPServerInstance(Application);

// // Socket.IO 설정 및 스트림 응답 처리
// HandleStreamedResponse(SocketIO(WebServer, { cors: { origin: process.env.CORS_ORIGIN } }));

// // 서버 시작
// WebServer.listen(Port, Hostname, () => {
//     // 주기적으로 패키지 버전 체크 및 업데이트
//     setInterval(async () => {
//         try{
//             const Response = await VersionChecker();
//             if(Response === 'UP_TO_DATE')
//                 return; // 최신 버전이면 아무것도 하지 않음
//             // g4f 패키지 업데이트
//             ChildProcess.spawn('pip', ['install', '-U', 'g4f']);
//         }catch(VersionUpdateError){
//             console.warn(VersionUpdateError);
//         }
//     }, 1000 * 60 * process.env.TIME_FOR_CHECK_AND_UPDATE_PACKAGES); // 환경 변수에 설정된 시간(분) 간격으로 실행

//     // 서버 시작 성공 메시지 출력
//     console.log(`서버가 네트워크 주소 (${Hostname}:${Port})에서 성공적으로 시작되었습니다.`);
// });

process.on('unhandledRejection', (UnhandledServerError) => {
    console.warn(UnhandledServerError);
    WebServer.close(() => process.exit(1));
});
