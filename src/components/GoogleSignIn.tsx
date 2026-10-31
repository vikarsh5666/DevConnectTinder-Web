import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";

type GoogleSignInProps = {
  disabled?: boolean;
  onSuccess: (credential: string) => void;
  onError: () => void;
};

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const GoogleSignIn = ({ disabled, onSuccess, onError }: GoogleSignInProps) => {
  if (!clientId) return null;

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError();
      return;
    }
    onSuccess(response.credential);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        className={`flex w-full justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`}
        style={{ colorScheme: "light" }}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={onError}
          text="signin_with"
          theme="outline"
          size="large"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
