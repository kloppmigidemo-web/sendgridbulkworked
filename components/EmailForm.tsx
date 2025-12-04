
import React, { useState } from 'react';
import { FormStatus } from '../types';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

export const EmailForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === FormStatus.Loading) return;

    setStatus(FormStatus.Loading);
    setMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
        signal: controller.signal, // Link the abort controller
      });
      
      clearTimeout(timeoutId); // Request finished, clear the timeout

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setStatus(FormStatus.Success);
      setMessage(data.message);
      setName('');
      setEmail('');
    } catch (error) {
      clearTimeout(timeoutId); // Also clear on error
      setStatus(FormStatus.Error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setMessage('Request timed out. The server may be busy or misconfigured. Please try again later.');
      } else {
        setMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8 transform hover:scale-105 transition-transform duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={status === FormStatus.Loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            {status === FormStatus.Loading ? <SpinnerIcon /> : <SendIcon />}
            <span className="ml-2">
              {status === FormStatus.Loading ? 'Sending...' : 'Send Email'}
            </span>
          </button>
        </div>
      </form>
      {message && (
        <div className={`mt-4 text-sm text-center font-medium p-3 rounded-md ${
            status === FormStatus.Success ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : ''
          } ${
            status === FormStatus.Error ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : ''
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};
