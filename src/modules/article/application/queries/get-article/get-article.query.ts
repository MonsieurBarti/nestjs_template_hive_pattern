import { TypedQuery } from '@/modules/shared/cqrs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ARTICLE_TOKENS } from '@/modules/article/article.tokens';
import { IArticleRepository } from '@/modules/article/domain/article/article.repository';
import { Article } from '@/modules/article/domain/article/article';

export type GetArticleQueryProps = {
  correlationId: string;
  id: string;
};

export type GetArticleResult = Article;

export class GetArticleQuery extends TypedQuery<GetArticleResult> {
  constructor(public readonly props: GetArticleQueryProps) {
    super();
  }
}

@QueryHandler(GetArticleQuery)
export class GetArticleQueryHandler implements IQueryHandler<GetArticleQuery> {
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
  ) {}

  async execute(query: GetArticleQuery): Promise<GetArticleResult> {
    const { id } = query.props;
    const article = await this.repository.findById(id);
    if (!article) {
      throw new Error('Article not found'); // Should use domain error
    }
    return article;
  }
}
