// ============================================================================
// HPSOP – Platform Orchestrator
//
// Single entry point orchestrating Performance Profiling, Data & Query Optimization,
// Scalability Framework, Resource Optimization Engine, Frontend Optimization Suite,
// Load & Stress Testing, Performance Dashboard, and HOIP telemetry.
// ============================================================================

import {
  SubsystemPerformanceProfile,
  BatchOptimizationConfig,
  PartitioningConfig,
  ResourceUtilizationMetrics,
  LoadTestResult,
  PerformanceDashboardView,
} from './types';
import { HPSOPPerformanceProfilingFramework } from './profiling';
import { HPSOPDataOptimizationLayer } from './data-optimization';
import { HPSOPScalabilityFramework } from './scalability';
import { HPSOPResourceOptimizationEngine } from './resource-optimization';
import { HPSOPFrontendOptimizationSuite } from './frontend-optimization';
import { HPSOPLoadTestingFramework } from './load-testing';
import { HPSOPPerformanceDashboardEngine } from './performance-dashboard';

/** Concrete return shape of HPSOPFrontendOptimizationSuite.getFrontendOptimizationReport(). */
export interface FrontendOptimizationReport {
  initialBundleSizeKb: number;
  codeSplittingChunksCount: number;
  lazyLoadingEnabled: boolean;
  domRenderTimeMs: number;
  firstContentfulPaintMs: number;
}

/** Full result of a performance evaluation session. */
export interface PerformanceSessionResult {
  performanceDashboard: PerformanceDashboardView;
  subsystemProfiles: SubsystemPerformanceProfile[];
  batchOptimization: BatchOptimizationConfig;
  partitioningConfig: PartitioningConfig;
  resourceMetrics: ResourceUtilizationMetrics;
  frontendReport: FrontendOptimizationReport;
  loadTestResult: LoadTestResult;
  telemetryPublished: boolean;
  latencyMs: number;
}

export class HPSOPPlatform {
  private profilingFramework = new HPSOPPerformanceProfilingFramework();
  private dataOptimizationLayer = new HPSOPDataOptimizationLayer();
  private scalabilityFramework = new HPSOPScalabilityFramework();
  private resourceEngine = new HPSOPResourceOptimizationEngine();
  private frontendSuite = new HPSOPFrontendOptimizationSuite();
  private loadTestingFramework = new HPSOPLoadTestingFramework();
  private dashboardEngine = new HPSOPPerformanceDashboardEngine();

  // Internal telemetry
  private telemetry = {
    totalProfilesGenerated: 0,
    totalBatchOptimizations: 0,
    totalLoadTestsExecuted: 0,
    totalDashboardsRendered: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute full Performance & Scalability Evaluation Session.
   */
  public executePerformanceSession(): PerformanceSessionResult {
    const start = performance.now();

    // 1. Build Performance Dashboard View
    const performanceDashboard = this.dashboardEngine.buildPerformanceDashboardView();

    // 2. Generate Subsystem Profiles
    const subsystemProfiles = this.profilingFramework.generateSubsystemProfiles();

    // 3. Batch Query Optimization
    const batchOptimization = this.dataOptimizationLayer.executeBatchQueryOptimization('PATIENT', 500, 8);

    // 4. Partitioning & Scalability Config
    const partitioningConfig = this.scalabilityFramework.getPartitioningConfig();

    // 5. Resource Metrics
    const resourceMetrics = this.resourceEngine.getResourceMetrics();

    // 6. Frontend Optimization Report
    const frontendReport = this.frontendSuite.getFrontendOptimizationReport();

    // 7. Load & Stress Test Simulation
    const loadTestResult = this.loadTestingFramework.runLoadTest('Enterprise High-Concurreny Load Test', 10000, 5000, 60);

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 8. Update Telemetry
    this.updateTelemetry(subsystemProfiles.length, 1, 1, 1, latencyMs);

    return {
      performanceDashboard,
      subsystemProfiles,
      batchOptimization,
      partitioningConfig,
      resourceMetrics,
      frontendReport,
      loadTestResult,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getProfilingFramework(): HPSOPPerformanceProfilingFramework {
    return this.profilingFramework;
  }

  public getDataOptimizationLayer(): HPSOPDataOptimizationLayer {
    return this.dataOptimizationLayer;
  }

  public getScalabilityFramework(): HPSOPScalabilityFramework {
    return this.scalabilityFramework;
  }

  public getResourceEngine(): HPSOPResourceOptimizationEngine {
    return this.resourceEngine;
  }

  public getFrontendSuite(): HPSOPFrontendOptimizationSuite {
    return this.frontendSuite;
  }

  public getLoadTestingFramework(): HPSOPLoadTestingFramework {
    return this.loadTestingFramework;
  }

  public getDashboardEngine(): HPSOPPerformanceDashboardEngine {
    return this.dashboardEngine;
  }

  private updateTelemetry(
    profilesCount: number,
    batchCount: number,
    loadTestCount: number,
    dashCount: number,
    latency: number
  ): void {
    this.telemetry.totalProfilesGenerated += profilesCount;
    this.telemetry.totalBatchOptimizations += batchCount;
    this.telemetry.totalLoadTestsExecuted += loadTestCount;
    this.telemetry.totalDashboardsRendered += dashCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalDashboardsRendered > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalDashboardsRendered).toFixed(3))
          : 0,
    };
  }
}

export const hpsop = new HPSOPPlatform();
