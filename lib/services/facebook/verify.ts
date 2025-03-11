import axios from 'axios';

interface VerificationResult {
  isValid: boolean;
  error?: string;
  pageName?: string;
}

export async function verifyFacebookPageToken(
  pageId: string,
  accessToken: string
): Promise<VerificationResult> {
  try {
    // Verify token by making a call to Facebook Graph API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'name'
        }
      }
    );

    return {
      isValid: true,
      pageName: response.data.name
    };
  } catch (error) {
    console.error('Error verifying Facebook page token:', error);
    return {
      isValid: false,
      error: 'Invalid page access token'
    };
  }
}