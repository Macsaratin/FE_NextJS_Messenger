'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/service/auth';

type RegisterFormValues = {
  fullname: string;
  username: string;
  email: string;
  number: string;
  password: string;
};

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage('');
    try {
      await authService.register({ ...data, roles: ['user'] });
      router.push('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Create Your Account</h2>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm font-medium text-center py-3 px-4 mb-6 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Fullname */}
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              className={`w-full border-2 px-4 py-2  text-black rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors ${
                errors.fullname ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Enter your full name"
              {...register('fullname', { required: true })}
            />
            {errors.fullname && (
              <p className="text-red-500 text-xs mt-1.5">Full Name is required</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Username</label>
            <input
              type="text"
              className={`w-full border-2 px-4 py-2 rounded-lg focus:ring-2  focus:ring-blue-300 focus:border-blue-400 transition-colors text-black ${
                errors.username ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Choose a username"
              {...register('username', { required: true })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1.5">Username is required</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className={`w-full border-2 px-4 py-2 text-black rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
              {...register('email', {
                required: true,
                pattern: /^\S+@\S+\.\S+$/,
              })}
            />
            {errors.email?.type === 'required' && (
              <p className="text-red-500 text-xs  mt-1.5">Email is required</p>
            )}
            {errors.email?.type === 'pattern' && (
              <p className="text-red-500 text-xs mt-1.5">Invalid email format</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Phone Number</label>
            <input
              type="text"
              className={`w-full border-2 px-4 py-2  text-black rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors ${
                errors.number ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Enter your phone number"
              {...register('number', { required: true })}
            />
            {errors.number && (
              <p className="text-red-500 text-xs mt-1.5">Phone Number is required</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className={`w-full border-2 px-4 py-2 text-black rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors ${
                errors.password ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Create a password"
              {...register('password', { required: true, minLength: 6 })}
            />
            {errors.password?.type === 'required' && (
              <p className="text-red-500 text-xs mt-1.5">Password is required</p>
            )}
            {errors.password?.type === 'minLength' && (
              <p className="text-red-500 text-xs mt-1.5">Password must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center mt-5 text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline font-semibold transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}