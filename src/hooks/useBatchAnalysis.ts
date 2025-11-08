import { useState, useCallback, useRef } from 'react';
import type { BatchJob, BatchAnalysisState, BatchStats, AnalysisResult } from '../types';
import { extractHeadingsFromUrl } from '../lib/extractHeadings';
import { buildHeadingHierarchy, countHeadingsByLevel, calculateMaxDepth } from '../lib/buildHierarchy';
import { validateHeadingStructure } from '../lib/validateStructure';

interface UseBatchAnalysisOptions {
  concurrency?: number; // Number of concurrent requests
  delayBetweenRequests?: number; // Delay in ms between requests
}

export function useBatchAnalysis(options: UseBatchAnalysisOptions = {}) {
  const { concurrency = 3, delayBetweenRequests = 500 } = options;

  const [state, setState] = useState<BatchAnalysisState>({
    jobs: [],
    isRunning: false,
    isPaused: false,
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);

  /**
   * Analyze a single URL using CORS proxy
   */
  const analyzeUrl = async (url: string): Promise<AnalysisResult> => {
    // Validate and normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Use extractHeadingsFromUrl which has CORS proxy fallback logic
    const headings = await extractHeadingsFromUrl(normalizedUrl);

    const hierarchy = buildHeadingHierarchy(headings);
    const validation = validateHeadingStructure(headings);
    const counts = countHeadingsByLevel(headings);
    const maxDepth = calculateMaxDepth(hierarchy);

    return {
      headings,
      hierarchy,
      validation,
      metrics: {
        totalHeadings: headings.length,
        h1Count: counts.h1,
        h2Count: counts.h2,
        h3Count: counts.h3,
        h4Count: counts.h4,
        h5Count: counts.h5,
        h6Count: counts.h6,
        maxDepth,
      },
    };
  };

  /**
   * Process a single job
   */
  const processJob = async (job: BatchJob, signal?: AbortSignal): Promise<BatchJob> => {
    try {
      const result = await analyzeUrl(job.url);
      return {
        ...job,
        status: 'completed',
        result,
        completedAt: Date.now(),
      };
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }
      return {
        ...job,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: Date.now(),
      };
    }
  };

  /**
   * Process jobs with concurrency control
   */
  const processJobs = async (jobs: BatchJob[]) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const results: BatchJob[] = [];
    const queue = [...jobs];
    const inProgress: Promise<BatchJob>[] = [];

    setState((prev) => ({
      ...prev,
      isRunning: true,
      startedAt: Date.now(),
    }));

    while (queue.length > 0 || inProgress.length > 0) {
      // Check if paused
      if (isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      // Check if aborted
      if (controller.signal.aborted) {
        break;
      }

      // Fill up to concurrency limit
      while (inProgress.length < concurrency && queue.length > 0) {
        const job = queue.shift()!;

        // Update job status to analyzing
        setState((prev) => ({
          ...prev,
          jobs: prev.jobs.map((j) =>
            j.id === job.id ? { ...j, status: 'analyzing' as const, startedAt: Date.now() } : j
          ),
        }));

        // Add delay between requests
        if (inProgress.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
        }

        const promise = processJob(
          { ...job, status: 'analyzing', startedAt: Date.now() },
          controller.signal
        ).then((result) => {
          // Remove from inProgress
          const index = inProgress.indexOf(promise);
          if (index > -1) {
            inProgress.splice(index, 1);
          }

          // Update state
          setState((prev) => ({
            ...prev,
            jobs: prev.jobs.map((j) => (j.id === result.id ? result : j)),
            completedJobs: prev.completedJobs + (result.status === 'completed' ? 1 : 0),
            failedJobs: prev.failedJobs + (result.status === 'failed' ? 1 : 0),
          }));

          results.push(result);
          return result;
        });

        inProgress.push(promise);
      }

      // Wait for at least one to complete
      if (inProgress.length > 0) {
        await Promise.race(inProgress);
      }
    }

    // Wait for all remaining to complete
    await Promise.all(inProgress);

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      completedAt: Date.now(),
    }));

    abortControllerRef.current = null;
  };

  /**
   * Start batch analysis
   */
  const startBatch = useCallback(async (urls: string[]) => {
    const jobs: BatchJob[] = urls.map((url, index) => ({
      id: `job-${Date.now()}-${index}`,
      url,
      status: 'pending',
    }));

    setState({
      jobs,
      isRunning: false,
      isPaused: false,
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
    });

    await processJobs(jobs);
  }, []);

  /**
   * Pause batch analysis
   */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  /**
   * Resume batch analysis
   */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  /**
   * Cancel batch analysis
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
  }, []);

  /**
   * Reset batch analysis
   */
  const reset = useCallback(() => {
    setState({
      jobs: [],
      isRunning: false,
      isPaused: false,
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
    });
  }, []);

  /**
   * Calculate aggregate statistics
   */
  const getStats = useCallback((): BatchStats => {
    const completedJobs = state.jobs.filter((j) => j.status === 'completed' && j.result);

    const totalHeadings = completedJobs.reduce(
      (sum, job) => sum + (job.result?.metrics.totalHeadings || 0),
      0
    );

    const totalErrors = completedJobs.reduce(
      (sum, job) => sum + (job.result?.validation.errors.length || 0),
      0
    );

    const totalWarnings = completedJobs.reduce(
      (sum, job) => sum + (job.result?.validation.warnings.length || 0),
      0
    );

    const pagesWithIssues = completedJobs.filter(
      (job) =>
        (job.result?.validation.errors.length || 0) > 0 ||
        (job.result?.validation.warnings.length || 0) > 0
    ).length;

    const pagesWithoutH1 = completedJobs.filter(
      (job) => (job.result?.metrics.h1Count || 0) === 0
    ).length;

    const pagesWithMultipleH1 = completedJobs.filter(
      (job) => (job.result?.metrics.h1Count || 0) > 1
    ).length;

    return {
      totalPages: state.totalJobs,
      completedPages: state.completedJobs,
      failedPages: state.failedJobs,
      totalHeadings,
      totalErrors,
      totalWarnings,
      avgHeadingsPerPage: completedJobs.length > 0 ? totalHeadings / completedJobs.length : 0,
      pagesWithIssues,
      pagesWithoutH1,
      pagesWithMultipleH1,
    };
  }, [state]);

  return {
    state,
    startBatch,
    pause,
    resume,
    cancel,
    reset,
    getStats,
  };
}
