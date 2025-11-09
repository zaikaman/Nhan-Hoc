/**
 * API Test Helper
 * File này dùng để test kết nối với Heroku backend
 */

import { generateLearningPath, generateQuiz, pollJobStatus } from '../services/learningPath';
import { API_BASE_URL } from './api';

/**
 * Test kết nối cơ bản đến server
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

/**
 * Test tạo lộ trình học tập
 */
export const testGenerateLearningPath = async () => {
  try {
    console.log('🚀 Testing generate learning path...');
    
    const response = await generateLearningPath({
      topic: 'Python Programming Basics',
      description: 'Introduction to Python for beginners',
      audienceLevel: 'beginner',
      lessonCount: 3,
      includeQuiz: true,
      quizPerLesson: 5,
    });
    
    console.log('✅ Job created:', response.job_id);
    
    console.log('⏳ Polling job status...');
    const result = await pollJobStatus(
      response.job_id,
      (status) => {
        console.log(`📊 Status: ${status.status}`);
      },
      30, // 30 attempts
      2000 // 2 seconds interval
    );
    
    if (result.status === 'completed') {
      console.log('✅ Learning path generated successfully!');
      console.log('📚 Result:', JSON.stringify(result.result, null, 2));
      return result;
    } else {
      console.error('❌ Job failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};

/**
 * Test tạo quiz
 */
export const testGenerateQuiz = async () => {
  try {
    console.log('🚀 Testing generate quiz...');
    
    const response = await generateQuiz(
      'Python Programming',
      'Variables and Data Types',
      'String Methods',
      'Learn about common string methods in Python like upper(), lower(), split(), etc.'
    );
    
    console.log('✅ Quiz job created:', response.job_id);
    
    console.log('⏳ Polling quiz status...');
    const result = await pollJobStatus(
      response.job_id,
      (status) => {
        console.log(`📊 Status: ${status.status}`);
      },
      30,
      2000
    );
    
    if (result.status === 'completed') {
      console.log('✅ Quiz generated successfully!');
      console.log('❓ Questions:', JSON.stringify(result.result, null, 2));
      return result;
    } else {
      console.error('❌ Quiz generation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};

/**
 * Chạy tất cả tests
 */
export const runAllTests = async () => {
  console.log('\n=================================');
  console.log('🧪 Starting API Tests');
  console.log('=================================\n');
  
  // Test 1: Connection
  console.log('Test 1: Connection Test');
  const isConnected = await testConnection();
  console.log(isConnected ? '✅ Connected' : '❌ Connection failed');
  console.log('');
  
  if (!isConnected) {
    console.log('❌ Cannot connect to server. Aborting tests.');
    return;
  }
  
  // Test 2: Generate Learning Path
  console.log('Test 2: Generate Learning Path');
  await testGenerateLearningPath();
  console.log('');
  
  // Test 3: Generate Quiz
  console.log('Test 3: Generate Quiz');
  await testGenerateQuiz();
  console.log('');
  
  console.log('=================================');
  console.log('✅ All tests completed!');
  console.log('=================================\n');
};

// Để test, uncomment dòng dưới và chạy file này
// runAllTests();
