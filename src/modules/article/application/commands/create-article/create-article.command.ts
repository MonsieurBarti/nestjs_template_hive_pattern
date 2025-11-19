import { TypedCommand } from '@/modules/shared/cqrs';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ARTICLE_TOKENS } from '@/modules/article/article.tokens';
import { IArticleRepository } from '@/modules/article/domain/article/article.repository';
import { Article } from '@/modules/article/domain/article/article';

export type CreateArticleCommandProps = {
  correlationId: string;
  title: string;
  content: string;
};

export class CreateArticleCommand extends TypedCommand<void> {
  constructor(public readonly props: CreateArticleCommandProps) {
    super();
  }
}

@CommandHandler(CreateArticleCommand)
export class CreateArticleCommandHandler
  implements ICommandHandler<CreateArticleCommand>
{
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
  ) {}

  async execute(command: CreateArticleCommand): Promise<void> {
    const { title, content } = command.props;
    const article = Article.createNew(title, content);
    await this.repository.save(article);
  }
}
