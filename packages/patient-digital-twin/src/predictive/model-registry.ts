import type {
  IModelRegistry,
  ModelMetadata,
  PredictionDomain,
  ModelStage
} from './pais-types';
import {
  ModelMetadataSchema,
  VALID_STAGE_TRANSITIONS
} from './pais-types';

/**
 * ModelRegistry subsystem for EWP-012.
 * Manages the registration, retrieval, and lifecycle of predictive ML models.
 */
export class ModelRegistry implements IModelRegistry {
  private readonly models: Map<string, { metadata: ModelMetadata; binary: ArrayBuffer }>;

  /**
   * Initializes the Model Registry with empty storage maps.
   */
  constructor() {
    this.models = new Map();
  }

  /**
   * Registers a new model with the provided metadata and binary payload.
   * Validates metadata against the schema.
   *
   * @param metadata - The model's metadata to register.
   * @param modelBinary - The actual model weights or binary format.
   * @throws Error if a model with the same ID already exists or validation fails.
   * @returns A promise resolving when registration is complete.
   */
  public async registerModel(metadata: ModelMetadata, modelBinary: ArrayBuffer): Promise<void> {
    const validatedMetadata = ModelMetadataSchema.parse(metadata);
    if (this.models.has(validatedMetadata.modelId)) {
      throw new Error(`Model with ID ${validatedMetadata.modelId} already exists`);
    }
    this.models.set(validatedMetadata.modelId, { metadata: validatedMetadata, binary: modelBinary });
  }

  /**
   * Retrieves a model and its binary by ID.
   *
   * @param modelId - The unique identifier of the model.
   * @returns The model metadata and binary, or null if not found.
   */
  public async getModel(modelId: string): Promise<{ metadata: ModelMetadata; binary: ArrayBuffer } | null> {
    const model = this.models.get(modelId);
    return model || null;
  }

  /**
   * Finds the first active production model for the given prediction domain.
   *
   * @param domain - The domain of prediction.
   * @returns The production model metadata, or null if none exists.
   */
  public async getProductionModel(domain: PredictionDomain): Promise<ModelMetadata | null> {
    for (const { metadata } of this.models.values()) {
      if (metadata.domain === domain && metadata.stage === 'production') {
        return metadata;
      }
    }
    return null;
  }

  /**
   * Promotes a model to a target stage.
   * Validates if the transition is allowed based on the model lifecycle.
   *
   * @param modelId - The unique identifier of the model.
   * @param targetStage - The target stage to promote to.
   * @throws Error if model doesn't exist or transition is invalid.
   * @returns A promise resolving when promotion is complete.
   */
  public async promoteModel(modelId: string, targetStage: ModelStage): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    const currentStage = model.metadata.stage;
    const allowedTransitions = VALID_STAGE_TRANSITIONS.get(currentStage) || [];
    
    if (!allowedTransitions.includes(targetStage)) {
      throw new Error(`Invalid stage transition from ${currentStage} to ${targetStage}`);
    }

    model.metadata.stage = targetStage;
    model.metadata.updatedAt = new Date().toISOString();
  }

  /**
   * Lists all models, optionally filtering by prediction domain.
   *
   * @param domain - The prediction domain to filter by (optional).
   * @returns A readonly array of model metadata.
   */
  public listModels(domain?: PredictionDomain): ReadonlyArray<ModelMetadata> {
    const metadatas = Array.from(this.models.values()).map(m => m.metadata);
    if (domain) {
      return metadatas.filter(m => m.domain === domain);
    }
    return metadatas;
  }

  /**
   * Deprecates a model by promoting it to the 'deprecated' stage.
   *
   * @param modelId - The unique identifier of the model.
   * @returns A promise resolving when deprecation is complete.
   */
  public async deprecateModel(modelId: string): Promise<void> {
    await this.promoteModel(modelId, 'deprecated');
  }
}
