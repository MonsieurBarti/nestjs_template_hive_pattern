import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TypedCommandBus, TypedQueryBus } from '@/modules/shared/cqrs';
import { CorrelationId } from '../../../../util/decorators/correlation-id.decorator';
import { CreateArticleCommand } from '../../application/commands/create-article/create-article.command';
import { GetArticleQuery } from '../../application/queries/get-article/get-article.query';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ArticleResponseDto } from '../dto/article-response.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly commandBus: TypedCommandBus,
    private readonly queryBus: TypedQueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 201, description: 'Article created successfully.' })
  async create(
    @Body() body: CreateArticleDto,
    @CorrelationId() correlationId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateArticleCommand({
        ...body,
        correlationId,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the article.',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found.' })
  async get(
    @Param('id') id: string,
    @CorrelationId() correlationId: string,
  ): Promise<ArticleResponseDto> {
    const result = await this.queryBus.execute(
      new GetArticleQuery({
        id,
        correlationId,
      }),
    );

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      isPublished: result.isPublished,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
