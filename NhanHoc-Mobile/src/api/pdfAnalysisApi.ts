/**
 * PDF Analysis API
 * API endpoints cho PDF analysis system
 */

import apiClient from './apiClient';

export interface PdfAnalysisResult {
  pdf_content: string; // base64 encoded PDF
  message?: string;
}

export interface PdfJobResponse {
  job_id: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  result?: PdfAnalysisResult;
  error?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  progress?: number;
  progress_message?: string;
}

/**
 * Create PDF analysis job - returns job_id immediately
 */
export const createPdfAnalysisJob = async (file: File | Blob): Promise<string> => {
  try {
    console.log('📊 Creating PDF analysis job...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiClient}/api/analyze-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create PDF analysis job');
    }

    const data: PdfJobResponse = await response.json();

    if (data.job_id) {
      console.log('✅ PDF Job created with ID:', data.job_id);
      return data.job_id;
    } else {
      throw new Error('Failed to create PDF analysis job');
    }
  } catch (error: any) {
    // console.error('❌ Error creating PDF analysis job:', error);
    throw error;
  }
};

/**
 * Get PDF job status by job_id
 */
export const getPdfJobStatus = async (jobId: string): Promise<PdfJobResponse> => {
  try {
    const response = await fetch(`${apiClient}/api/analyze-pdf/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get PDF job status');
    }

    return await response.json();
  } catch (error: any) {
    // console.error('❌ Error getting PDF job status:', error);
    throw error;
  }
};

/**
 * Poll PDF job status until completed or failed
 */
export const pollPdfJobStatus = async (
  jobId: string,
  maxAttempts: number = 120,
  interval: number = 1000,
  onProgress?: (progress: number, message: string) => void
): Promise<PdfAnalysisResult> => {
  let attempts = 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[PDF Polling] Attempt ${attempts}/${maxAttempts} - Job ID: ${jobId}`);

    try {
      const jobData = await getPdfJobStatus(jobId);
      console.log(`[PDF Polling] Status: ${jobData.status}`);

      // Reset error counter on successful request
      consecutiveErrors = 0;

      // Update progress if callback provided
      if (onProgress && jobData.progress !== undefined && jobData.progress_message) {
        onProgress(jobData.progress, jobData.progress_message);
      }

      if (jobData.status === 'completed' && jobData.result) {
        console.log('[PDF Polling] ✅ Job completed!');
        return jobData.result; // RETURN IMMEDIATELY
      } else if (jobData.status === 'failed') {
        // console.error('[PDF Polling] ❌ Job failed:', jobData.error);
        throw new Error(jobData.error || 'PDF analysis failed');
      }

      // Job is still pending, wait before next attempt
      console.log(`[PDF Polling] Job still pending, waiting ${interval}ms...`);
      await new Promise(resolve => setTimeout(resolve, interval));

    } catch (error: any) {
      consecutiveErrors++;

      // If job not found and tried multiple times, stop
      if (error?.message?.includes('Không tìm thấy job') || error?.statusCode === 404) {
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.log('[PDF Polling] ⚠️ Job not found after multiple attempts, stopping...');
          throw new Error('Job không tồn tại hoặc đã bị xóa');
        }
      }

      // If exhausted all attempts, throw error
      if (attempts >= maxAttempts) {
        throw new Error('Polling timeout - PDF analysis took too long to complete');
      }

      // Wait before retry
      console.log(`[PDF Polling] ⚠️ Error occurred (${consecutiveErrors}/${maxConsecutiveErrors}), retrying in ${interval}ms...`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('Polling timeout - maximum attempts reached');
};

/**
 * Analyze PDF - complete flow (create job + poll for result)
 */
export const analyzePdf = async (
  file: File | Blob,
  onProgress?: (progress: number, message: string) => void
): Promise<PdfAnalysisResult> => {
  try {
    console.log('📊 Starting PDF analysis...');

    // Step 1: Create job
    const jobId = await createPdfAnalysisJob(file);

    // Step 2: Poll for result
    const result = await pollPdfJobStatus(jobId, 120, 1000, onProgress);

    console.log('✅ PDF analysis completed successfully');
    return result;
  } catch (error: any) {
    // console.error('❌ Error analyzing PDF:', error);
    throw error;
  }
};

export default {
  createPdfAnalysisJob,
  getPdfJobStatus,
  pollPdfJobStatus,
  analyzePdf,
};
