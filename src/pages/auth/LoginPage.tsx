import { LoginForm } from '../../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
