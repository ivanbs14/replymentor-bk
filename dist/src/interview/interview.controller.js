"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
const common_1 = require("@nestjs/common");
const interview_service_1 = require("./interview.service");
let InterviewController = class InterviewController {
    interviewService;
    constructor(interviewService) {
        this.interviewService = interviewService;
    }
    createContext(request, payload) {
        return this.interviewService.createContext(request.user.userId, payload);
    }
    getLatestContext(request) {
        return this.interviewService.getLatestContext(request.user.userId);
    }
    listContexts(request) {
        return this.interviewService.listContexts(request.user.userId);
    }
    startSession(request, payload) {
        return this.interviewService.startSession(request.user.userId, payload);
    }
    addTranscript(request, sessionId, payload) {
        return this.interviewService.addTranscript(request.user.userId, sessionId, payload);
    }
    generateResponse(request, sessionId, payload) {
        return this.interviewService.generateResponse(request.user.userId, sessionId, payload);
    }
    endSession(request, sessionId) {
        return this.interviewService.endSession(request.user.userId, sessionId);
    }
    getSummary(request, sessionId) {
        return this.interviewService.getSummary(request.user.userId, sessionId);
    }
};
exports.InterviewController = InterviewController;
__decorate([
    (0, common_1.Post)('context'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "createContext", null);
__decorate([
    (0, common_1.Get)('context/latest'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "getLatestContext", null);
__decorate([
    (0, common_1.Get)('contexts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "listContexts", null);
__decorate([
    (0, common_1.Post)('sessions/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/transcripts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "addTranscript", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/generate-response'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "generateResponse", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/end'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "endSession", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewController.prototype, "getSummary", null);
exports.InterviewController = InterviewController = __decorate([
    (0, common_1.Controller)('interview'),
    __metadata("design:paramtypes", [interview_service_1.InterviewService])
], InterviewController);
//# sourceMappingURL=interview.controller.js.map