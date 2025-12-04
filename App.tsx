
import React from 'react';
import { EmailForm } from './components/EmailForm';

const App: React.FC = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">We'll send you a confirmation email.</p>
        </header>
        <EmailForm />
      </div>
    </main>
  );
};

export default App;
