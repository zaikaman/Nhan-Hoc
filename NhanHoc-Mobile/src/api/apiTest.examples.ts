/**
 * API Test Examples
 * File này chứa các ví dụ test API
 * Có thể chạy để verify API hoạt động đúng
 */

import { quizApi, resourceApi, roadmapApi } from '../api';
import type {
    QuizRequest,
    ResourceRequest,
    RoadmapRequest,
} from '../types/api';

/**
 * Test 1: Roadmap API
 */
export async function testRoadmapApi() {
  console.log('🧪 Testing Roadmap API...\n');

  const request: RoadmapRequest = {
    topic: 'React Native Development',
    time: '4 weeks',
    knowledge_level: 'Beginner',
  };

  try {
    // Method 1: Create và wait
    console.log('📝 Creating roadmap...');
    const result = await roadmapApi.createAndWaitRoadmap(
      request,
      (status) => {
        console.log(`   📊 Status: ${status.status}`);
      }
    );

    if (result.status === 'completed') {
      console.log('✅ Roadmap created successfully!');
      console.log('📚 Result:', JSON.stringify(result.result, null, 2));
      return result;
    } else {
      console.error('❌ Roadmap creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

/**
 * Test 2: Quiz API
 */
export async function testQuizApi() {
  console.log('🧪 Testing Quiz API...\n');

  const request: QuizRequest = {
    course: 'React Native',
    topic: 'State Management',
    subtopic: 'useState Hook',
    description: 'Learn how to use useState for component state management',
  };

  try {
    // Method 2: Create job first, then poll
    console.log('📝 Creating quiz job...');
    const createResponse = await quizApi.createQuiz(request);
    console.log(`✅ Job created: ${createResponse.job_id}`);

    console.log('⏳ Polling for result...');
    const result = await quizApi.pollQuizStatus(
      createResponse.job_id,
      (status) => {
        console.log(`   📊 Status: ${status.status}`);
      }
    );

    if (result.status === 'completed') {
      console.log('✅ Quiz created successfully!');
      console.log(`❓ Number of questions: ${result.result?.questions.length}`);
      console.log('📚 Questions:', JSON.stringify(result.result, null, 2));
      return result;
    } else {
      console.error('❌ Quiz creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

/**
 * Test 3: Resource API
 */
export async function testResourceApi() {
  console.log('🧪 Testing Resource API...\n');

  const request: ResourceRequest = {
    course: 'JavaScript',
    knowledge_level: 'Intermediate',
    description: 'Learn about Promises and async/await',
    time: '2 hours',
  };

  try {
    console.log('📝 Creating resource...');
    const result = await resourceApi.createAndWaitResource(
      request,
      (status) => {
        console.log(`   📊 Status: ${status.status}`);
      }
    );

    if (result.status === 'completed') {
      console.log('✅ Resource created successfully!');
      console.log('📚 Content length:', result.result?.length, 'characters');
      console.log('📝 Content preview:', result.result?.substring(0, 200) + '...');
      return result;
    } else {
      console.error('❌ Resource creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

/**
 * Test 4: Check existing job status
 */
export async function testCheckJobStatus(jobId: string) {
  console.log(`🧪 Testing Job Status Check for: ${jobId}\n`);

  try {
    // Try all APIs since we don't know which one
    console.log('📝 Checking roadmap status...');
    try {
      const status = await roadmapApi.getRoadmapStatus(jobId);
      console.log('✅ Found in Roadmap API:', status.status);
      return status;
    } catch (e) {
      console.log('   Not a roadmap job');
    }

    console.log('📝 Checking quiz status...');
    try {
      const status = await quizApi.getQuizStatus(jobId);
      console.log('✅ Found in Quiz API:', status.status);
      return status;
    } catch (e) {
      console.log('   Not a quiz job');
    }

    console.log('📝 Checking resource status...');
    try {
      const status = await resourceApi.getResourceStatus(jobId);
      console.log('✅ Found in Resource API:', status.status);
      return status;
    } catch (e) {
      console.log('   Not a resource job');
    }

    console.error('❌ Job not found in any API');
    return null;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

/**
 * Test 5: Error handling
 */
export async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');

  try {
    // Test with invalid data
    console.log('📝 Testing with invalid request...');
    await quizApi.createQuiz({
      course: '',
      topic: '',
      subtopic: '',
      description: '',
    });
  } catch (error) {
    console.log('✅ Error caught successfully!');
    console.log('   Error:', error);
  }

  try {
    // Test with non-existent job ID
    console.log('📝 Testing with non-existent job ID...');
    await roadmapApi.getRoadmapStatus('invalid-job-id');
  } catch (error) {
    console.log('✅ Error caught successfully!');
    console.log('   Error:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Running All API Tests...\n');
  console.log('=' .repeat(50) + '\n');

  // Test 1
  await testRoadmapApi();
  console.log('\n' + '='.repeat(50) + '\n');

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2
  await testQuizApi();
  console.log('\n' + '='.repeat(50) + '\n');

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 3
  await testResourceApi();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4
  await testErrorHandling();
  console.log('\n' + '='.repeat(50) + '\n');

  console.log('✅ All tests completed!\n');
}

// Export default for easy import
export default {
  testRoadmapApi,
  testQuizApi,
  testResourceApi,
  testCheckJobStatus,
  testErrorHandling,
  runAllTests,
};
