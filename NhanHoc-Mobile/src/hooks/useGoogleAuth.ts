import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

// Cần thiết cho việc đóng browser sau khi auth
WebBrowser.maybeCompleteAuthSession();

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

interface UseGoogleAuthResult {
  promptAsync: () => Promise<void>;
  isLoading: boolean;
  userInfo: GoogleUserInfo | null;
  error: string | null;
  accessToken: string | null;
}

// Discovery document cho Google OAuth
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Custom hook để xử lý Google Authentication
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Lấy Web Client ID từ app.json
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId;

  // Tạo redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'mynewapp',
  });

  // Tạo auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: webClientId || '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    },
    discovery
  );

  // Xử lý response từ Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setAccessToken(authentication.accessToken);
        fetchUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Đăng nhập thất bại');
      setIsLoading(false);
    } else if (response?.type === 'cancel') {
      setError('Người dùng đã hủy đăng nhập');
      setIsLoading(false);
    }
  }, [response]);

  /**
   * Lấy thông tin user từ Google API
   */
  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const info = await response.json();
      setUserInfo(info);
      setError(null);
      console.log('✅ Đăng nhập thành công:', info.email);
    } catch (err: any) {
      setError(err.message || 'Không thể lấy thông tin người dùng');
      console.error('❌ Error fetching user info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bắt đầu quá trình đăng nhập
   */
  const handlePromptAsync = async () => {
    if (!webClientId) {
      setError('Google Client ID chưa được cấu hình trong app.json');
      return;
    }

    if (!request) {
      setError('Auth request chưa sẵn sàng. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Bắt đầu Google Sign-In...');
      console.log('📍 Redirect URI:', redirectUri);
      console.log('🔑 Client ID:', webClientId?.substring(0, 20) + '...');
      
      await promptAsync();
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập');
      setIsLoading(false);
    }
  };

  return {
    promptAsync: handlePromptAsync,
    isLoading,
    userInfo,
    error,
    accessToken,
  };
}
