import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

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

interface GoogleAuthResult {
  success: boolean;
  userInfo?: GoogleUserInfo;
  error?: string;
}

export class GoogleAuthService {
  private static webClientId = Constants.expoConfig?.extra?.googleWebClientId;
  
  // Discovery document cho Google OAuth
  private static discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  /**
   * Đăng nhập với Google
   */
  static async signInWithGoogle(): Promise<GoogleAuthResult> {
    try {
      if (!this.webClientId) {
        console.error('❌ Google Web Client ID chưa được cấu hình trong app.json');
        return {
          success: false,
          error: 'Google Client ID chưa được cấu hình. Vui lòng kiểm tra app.json'
        };
      }

      console.log('🔐 Bắt đầu Google Sign-In...');
      
      // Tạo redirect URI
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'mynewapp',
      });
      
      console.log('📍 Redirect URI:', redirectUri);

      // Tạo auth request
      const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
          clientId: this.webClientId,
          scopes: ['openid', 'profile', 'email'],
          redirectUri,
        },
        this.discovery
      );

      // Không thể dùng hooks ở đây, cần refactor
      // Sẽ tạo custom hook thay thế
      
      return {
        success: false,
        error: 'Method needs refactoring - see useGoogleAuth hook'
      };
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      return {
        success: false,
        error: error.message || 'Đã xảy ra lỗi khi đăng nhập với Google'
      };
    }
  }

  /**
   * Lấy thông tin user từ Google API
   */
  static async getUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      console.log('✅ User info retrieved:', userInfo.email);
      return userInfo;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Đăng xuất
   */
  static async signOut(): Promise<void> {
    try {
      // Clear local storage hoặc async storage nếu có
      console.log('✅ Đã đăng xuất');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }
}
