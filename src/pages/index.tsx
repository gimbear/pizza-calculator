import React from 'react';
import Head from "next/head";
import '@/styles/globals.css';
import PizzaCalculator from '@/components/PizzaCalculator';

const Home = () => {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Head>
          <title>Pizza Calculator</title>
          <meta name="description" content="Calculate your pizza dough ingredients easily." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-6">
            🍕 Pizza Calculator
          </h1>
          <PizzaCalculator />
        </main>
  
        <footer className="text-center mt-8 text-gray-600">
          <p>
            Built with ❤️ by Erik Gimbergsson
          </p>
        </footer>
      </div>
    );
  };
  
  export default Home;