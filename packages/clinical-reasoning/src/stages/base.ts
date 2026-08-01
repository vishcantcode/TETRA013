import { ReasoningContext } from '../contracts';

export interface PipelineStage<TInput, TOutput> {
  readonly name: string;
  execute(context: ReasoningContext, input: TInput): Promise<TOutput>;
}
