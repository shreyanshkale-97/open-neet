import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Version,
  BadRequestException,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { GetUser } from '../core/auth/decorators/get-user.decorator';
import { OwnPaperService } from './own-paper.service';
import { HuggingFaceDatasetService } from './services/huggingface-dataset.service';
import {
  NEET_2027_SYLLABUS,
  getNeet2027SyllabusSummary,
} from './datasets/neet-2027-syllabus.dataset';
import * as fs from 'fs';
import * as path from 'path';

@Controller('ai')
export class OwnPaperController {
  private readonly logger = new Logger(OwnPaperController.name);

  constructor(
    private ownPaperService: OwnPaperService,
    private hfDatasetService: HuggingFaceDatasetService,
  ) {}

  @Post('own-paper')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req: any, file: any, cb: any) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    })
  )
  async processOwnPaper(
    @UploadedFile() file: any,
    @GetUser('id') userId: string,
    @Headers('x-job-id') jobId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No PDF file uploaded');
    }
    this.logger.log(`Own Paper upload from user ${userId} (job ${jobId || 'none'}): ${file.originalname} (${file.size} bytes)`);
    return this.ownPaperService.processNeetPaper(file.buffer, file.originalname, userId, jobId);
  }

  @Get('own-paper/progress/:jobId')
  @UseGuards(JwtAuthGuard)
  @Version('1')
  async getProgress(@Param('jobId') jobId: string) {
    const progress = this.ownPaperService.getJobProgress(jobId);
    if (!progress) {
      return {
        jobId,
        status: 'idle',
        progressPercent: 0,
        currentBatch: 0,
        totalBatches: 0,
        currentPages: 'Initializing...',
        extractedQuestionsCount: 0,
        statusText: 'Preparing PDF processing...',
      };
    }
    return progress;
  }

  // Public endpoint for diagram images with robust question-number fallback matching
  @Get('storage/diagrams/:filename')
  @Version('1')
  async getDiagramAsset(@Param('filename') filename: string, @Res() res: any) {
    const safeName = path.basename(filename);
    const diagramsDir = path.resolve(process.cwd(), 'assets/diagrams');
    let filePath = path.join(diagramsDir, safeName);

    // 1. If exact file does not exist, search for any file ending with _q{num}.png
    if (!fs.existsSync(filePath)) {
      const qMatch = safeName.match(/_q(\d{1,3})\.png$/i);
      if (qMatch) {
        const qNum = qMatch[1];
        if (fs.existsSync(diagramsDir)) {
          const files = fs.readdirSync(diagramsDir);
          const fallbackFile = files.find((f) => f.endsWith(`_q${qNum}.png`));
          if (fallbackFile) {
            filePath = path.join(diagramsDir, fallbackFile);
          }
        }
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader('Content-Type', 'image/png');
      return res.sendFile(filePath);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
        <rect width="400" height="120" fill="#131B2A" rx="8" />
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#6366F1" font-weight="bold" font-family="sans-serif" font-size="16">🖼️ Diagram Reference</text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="12">Original Booklet Figure/Circuit</text>
      </svg>
    `);
  }

  // NMC NEET UG 2026/2027 Official Syllabus & Weightage Data Endpoint
  @Get('syllabus/neet-2027')
  @Version('1')
  async getNeet2027Syllabus() {
    return {
      status: 'SUCCESS',
      syllabusVersion: 'NEET_UG_2026_2027_NMC_NCERT_v1',
      summary: getNeet2027SyllabusSummary(),
      subjects: NEET_2027_SYLLABUS,
    };
  }

  @Get('syllabus/neet-2027/summary')
  @Version('1')
  async getNeet2027SyllabusSummaryEndpoint() {
    return {
      status: 'SUCCESS',
      summary: getNeet2027SyllabusSummary(),
    };
  }

  // Open Dataset & Hugging Face Sync Endpoints
  @Get('dataset/sources')
  @Version('1')
  async getDatasetSources() {
    return {
      status: 'SUCCESS',
      availableDatasets: this.hfDatasetService.getAvailableDatasets(),
    };
  }

  @Post('dataset/sync-huggingface')
  @Version('1')
  async syncHuggingFaceDataset(@Headers('x-dataset-id') datasetId?: string) {
    const targetDataset = datasetId || 'sweatSmile/neet-biology-qa';
    const result = await this.hfDatasetService.fetchFromHuggingFace(targetDataset, 100);
    return {
      status: 'SUCCESS',
      datasetId: targetDataset,
      importedQuestionsCount: result.length,
      sampleQuestions: result.slice(0, 3),
    };
  }
}

