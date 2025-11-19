import { z } from 'zod';
import { randomUUID } from 'crypto';

export const ArticlePropsSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ArticleProps = z.infer<typeof ArticlePropsSchema>;

export class Article {
  private readonly _id: string;
  private _title: string;
  private _content: string;
  private _isPublished: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ArticleProps) {
    this._id = props.id;
    this._title = props.title;
    this._content = props.content;
    this._isPublished = props.isPublished;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: ArticleProps): Article {
    const validated = ArticlePropsSchema.parse(props);
    return new Article(validated);
  }

  public static createNew(title: string, content: string): Article {
    return Article.create({
      id: randomUUID(),
      title,
      content,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public get id(): string {
    return this._id;
  }
  public get title(): string {
    return this._title;
  }
  public get content(): string {
    return this._content;
  }
  public get isPublished(): boolean {
    return this._isPublished;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public publish(): void {
    this._isPublished = true;
    this._updatedAt = new Date();
  }
}
